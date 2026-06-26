'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Field, TextArea, TextInput } from './fields'
import { BlockingFields, FormError, GenerateBar } from './form-shared'
import { CompliancePhase } from './compliance-phase'
import {
  getPrFaqMissingFields,
  initialPrFaq,
  isPrFaqPhaseComplete,
  PR_FAQ_FIELD_SPECS,
  type PrFaqData,
  type PrFaqPhase,
} from './modes'
import {
  RequiredOverridesControl,
  type RequiredOverrides,
} from './required-overrides'
import {
  hasComplianceContent,
  initialCompliance,
  type ComplianceData,
} from './compliance'
import type { PrdGeneration } from './use-prd-generation'
import type { AiFeatureControls } from './ai-feature'

type TabId = PrFaqPhase | 'compliance'

const PHASES: { id: PrFaqPhase; label: string; n: number }[] = [
  { id: 'customer', label: 'Customer & Problem', n: 1 },
  { id: 'vision', label: 'Product Vision', n: 2 },
  { id: 'strategic', label: 'Strategic & Execution', n: 3 },
]

export function PrFaqForm({
  productName,
  authorName,
  gen,
  ai,
  onDirtyChange,
}: {
  productName: string
  authorName: string
  gen: PrdGeneration
  ai: AiFeatureControls
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [data, setData] = useState<PrFaqData>(initialPrFaq)
  const [active, setActive] = useState<TabId>('customer')
  const [requiredOverrides, setRequiredOverrides] = useState<RequiredOverrides>(
    {},
  )
  const [compliance, setCompliance] = useState<ComplianceData>(initialCompliance)

  // Dirty when any mode-specific field or compliance content is present.
  useEffect(() => {
    const dirty =
      Object.values(data).some((v) => v.trim().length > 0) ||
      hasComplianceContent(compliance)
    onDirtyChange?.(dirty)
  }, [data, compliance, onDirtyChange])

  const set = useCallback(
    <K extends keyof PrFaqData>(key: K, value: PrFaqData[K]) =>
      setData((prev) => ({ ...prev, [key]: value })),
    [],
  )

  const setRequired = useCallback(
    (key: string, required: boolean) =>
      setRequiredOverrides((prev) => ({ ...prev, [key]: required })),
    [],
  )

  const setComplianceField = useCallback(
    (patch: Partial<ComplianceData>) =>
      setCompliance((prev) => ({ ...prev, ...patch })),
    [],
  )

  const customerDone = isPrFaqPhaseComplete('customer', data, requiredOverrides)
  const visionDone = isPrFaqPhaseComplete('vision', data, requiredOverrides)
  const strategicDone = isPrFaqPhaseComplete(
    'strategic',
    data,
    requiredOverrides,
  )
  const ready = customerDone && visionDone && strategicDone && ai.ready
  const complianceFilled = hasComplianceContent(compliance)

  const isLocked = (phase: PrFaqPhase) => {
    if (phase === 'vision') return !customerDone
    if (phase === 'strategic') return !customerDone || !visionDone
    return false
  }

  const phaseDone: Record<PrFaqPhase, boolean> = {
    customer: customerDone,
    vision: visionDone,
    strategic: strategicDone,
  }

  const nextLabel =
    active === 'customer'
      ? 'Product Vision'
      : active === 'vision'
        ? 'Strategic & Execution'
        : null

  const handleGenerate = () =>
    gen.generate({
      mode: 'pr-faq',
      authorName,
      ...data,
      // The vision-phase product name wins; fall back to the universal header.
      productName: data.productName.trim() || productName,
      requiredOverrides,
      compliance,
      ...ai.payload,
    })

  return (
    <div className="flex flex-col gap-6">
      {/* Phase tabs */}
      <div
        role="tablist"
        aria-label="PR/FAQ phases"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
      >
        {PHASES.map((phase) => {
          const locked = isLocked(phase.id)
          const isActive = active === phase.id
          const done = phaseDone[phase.id]
          return (
            <button
              key={phase.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              disabled={locked}
              onClick={() => !locked && setActive(phase.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                isActive
                  ? 'border-mode-pr-faq bg-mode-pr-faq text-card shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-mode-pr-faq/40',
                locked && 'cursor-not-allowed opacity-55 hover:border-border',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isActive
                    ? 'bg-card/20 text-card'
                    : done
                      ? 'bg-mode-pr-faq text-card'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {locked ? (
                  <Lock className="size-3.5" />
                ) : done ? (
                  <Check className="size-3.5" />
                ) : (
                  phase.n
                )}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium leading-tight">
                  {phase.label}
                </span>
                <span
                  className={cn(
                    'text-xs',
                    isActive ? 'text-card/80' : 'text-muted-foreground',
                  )}
                >
                  Phase {phase.n}
                </span>
              </span>
            </button>
          )
        })}

        {/* Phase 4 — Compliance & Review (always accessible) */}
        <button
          role="tab"
          type="button"
          aria-selected={active === 'compliance'}
          onClick={() => setActive('compliance')}
          className={cn(
            'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
            active === 'compliance'
              ? 'border-mode-pr-faq bg-mode-pr-faq text-card shadow-sm'
              : 'border-border bg-card text-foreground hover:border-mode-pr-faq/40',
          )}
        >
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              active === 'compliance'
                ? 'bg-card/20 text-card'
                : complianceFilled
                  ? 'bg-mode-pr-faq text-card'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {complianceFilled && active !== 'compliance' ? (
              <Check className="size-3.5" />
            ) : (
              <Lock className="size-3.5" />
            )}
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-medium leading-tight">
              Compliance &amp; Review
            </span>
            <span
              className={cn(
                'text-xs',
                active === 'compliance'
                  ? 'text-card/80'
                  : 'text-muted-foreground',
              )}
            >
              Optional
            </span>
          </span>
        </button>
      </div>

      {active !== 'compliance' && (
        <BlockingFields
          missing={getPrFaqMissingFields(active, data, requiredOverrides)}
          nextLabel={nextLabel}
        />
      )}

      <div
        role="tabpanel"
        className="flex flex-col gap-6 rounded-2xl border border-border bg-card/50 p-5 shadow-sm sm:p-7"
      >
        {active !== 'compliance' && (
          <RequiredOverridesControl
            specs={PR_FAQ_FIELD_SPECS[active]}
            overrides={requiredOverrides}
            onChange={setRequired}
          />
        )}
        {active === 'customer' && (
          <>
            <Field
              label="Target Customer"
              htmlFor="pf-targetCustomer"
              required
              hint="Who specifically benefits? Be concrete."
            >
              <TextInput
                id="pf-targetCustomer"
                value={data.targetCustomer}
                onChange={(e) => set('targetCustomer', e.target.value)}
                placeholder="e.g. Mid-market RevOps leads"
              />
            </Field>
            <Field
              label="Customer's Current Pain"
              htmlFor="pf-currentPain"
              required
              hint="Today, what do they struggle with?"
            >
              <TextArea
                id="pf-currentPain"
                value={data.currentPain}
                onChange={(e) => set('currentPain', e.target.value)}
                placeholder="Describe the pain they live with today..."
              />
            </Field>
            <Field
              label="Why Existing Solutions Fail"
              htmlFor="pf-whyExistingFail"
              required
            >
              <TextArea
                id="pf-whyExistingFail"
                value={data.whyExistingFail}
                onChange={(e) => set('whyExistingFail', e.target.value)}
                placeholder="What do current alternatives get wrong?"
              />
            </Field>
          </>
        )}

        {active === 'vision' && (
          <>
            <Field
              label="Product Name"
              htmlFor="pf-productName"
              required
              hint="Customer-facing name"
            >
              <TextInput
                id="pf-productName"
                value={data.productName}
                onChange={(e) => set('productName', e.target.value)}
                placeholder="e.g. Pulse"
              />
            </Field>
            <Field
              label="Launch Date"
              htmlFor="pf-launchDate"
              required
              hint="Fictional is fine for the PR"
            >
              <TextInput
                id="pf-launchDate"
                type="date"
                value={data.launchDate}
                onChange={(e) => set('launchDate', e.target.value)}
              />
            </Field>
            <Field
              label="Key Customer Benefit"
              htmlFor="pf-keyBenefit"
              required
              hint="In customer language, what does this do for them?"
            >
              <TextArea
                id="pf-keyBenefit"
                value={data.keyBenefit}
                onChange={(e) => set('keyBenefit', e.target.value)}
                placeholder="The single most important benefit..."
              />
            </Field>
            <Field
              label="Customer Quote"
              htmlFor="pf-customerQuote"
              required
            >
              <TextInput
                id="pf-customerQuote"
                value={data.customerQuote}
                onChange={(e) => set('customerQuote', e.target.value)}
                placeholder={'"This changed how my team works..."'}
              />
            </Field>
            <Field
              label="Executive Quote"
              htmlFor="pf-executiveQuote"
              required
            >
              <TextInput
                id="pf-executiveQuote"
                value={data.executiveQuote}
                onChange={(e) => set('executiveQuote', e.target.value)}
                placeholder={'"We built this because..."'}
              />
            </Field>
          </>
        )}

        {active === 'strategic' && (
          <>
            <Field label="Why Now?" htmlFor="pf-whyNow" required>
              <TextArea
                id="pf-whyNow"
                value={data.whyNow}
                onChange={(e) => set('whyNow', e.target.value)}
                placeholder="Why is this the right moment?"
              />
            </Field>
            <Field
              label="What Needs to Be True"
              htmlFor="pf-whatMustBeTrue"
              required
              hint="Assumptions that must hold"
            >
              <TextArea
                id="pf-whatMustBeTrue"
                value={data.whatMustBeTrue}
                onChange={(e) => set('whatMustBeTrue', e.target.value)}
                placeholder="For this to succeed, these must be true..."
              />
            </Field>
            <Field
              label="Hardest Part to Build"
              htmlFor="pf-hardestPart"
              required
            >
              <TextArea
                id="pf-hardestPart"
                value={data.hardestPart}
                onChange={(e) => set('hardestPart', e.target.value)}
                placeholder="The riskiest or most complex piece..."
              />
            </Field>
            <Field
              label="Worst-Case Failure"
              htmlFor="pf-worstCase"
              required
            >
              <TextArea
                id="pf-worstCase"
                value={data.worstCase}
                onChange={(e) => set('worstCase', e.target.value)}
                placeholder="If this goes badly, what happens?"
              />
            </Field>
            <Field
              label="Success Metrics"
              htmlFor="pf-successMetrics"
              required
              hint='How will you measure success? You can type "TBD".'
            >
              <TextArea
                id="pf-successMetrics"
                value={data.successMetrics}
                onChange={(e) => set('successMetrics', e.target.value)}
                placeholder="e.g. 10k activated teams in 6 months, or TBD"
              />
            </Field>
          </>
        )}

        {active === 'compliance' && (
          <CompliancePhase data={compliance} onChange={setComplianceField} />
        )}
      </div>

      {ai.section}

      <FormError message={gen.error} />
      <GenerateBar
        ready={ready}
        generating={gen.generating}
        hint="Complete all three phases to generate your PR/FAQ."
        onGenerate={handleGenerate}
      />
    </div>
  )
}
