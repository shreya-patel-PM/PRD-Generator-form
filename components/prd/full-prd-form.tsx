'use client'

import { useCallback, useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BlockingFields, FormError, GenerateBar } from './form-shared'
import { ProblemPhase } from './problem-phase'
import { SolutionPhase } from './solution-phase'
import { RisksPhase } from './risks-phase'
import { CompliancePhase } from './compliance-phase'
import {
  FULL_FIELD_SPECS,
  getMissingFields,
  initialData,
  isPhaseComplete,
  type Phase,
  type PrdData,
} from './types'
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

type TabId = Phase | 'compliance'

const PHASES: { id: Phase; label: string; n: number }[] = [
  { id: 'problem', label: 'Problem Space', n: 1 },
  { id: 'solution', label: 'Solution Space', n: 2 },
  { id: 'risks', label: 'Risks & Dependencies', n: 3 },
]

export function FullPrdForm({
  productName,
  authorName,
  gen,
  ai,
}: {
  productName: string
  authorName: string
  gen: PrdGeneration
  ai: AiFeatureControls
}) {
  const [data, setData] = useState<PrdData>(initialData)
  const [active, setActive] = useState<TabId>('problem')
  const [requiredOverrides, setRequiredOverrides] = useState<RequiredOverrides>(
    {},
  )
  const [compliance, setCompliance] = useState<ComplianceData>(initialCompliance)

  const set = useCallback(
    <K extends keyof PrdData>(key: K, value: PrdData[K]) =>
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

  // The universal header lives in the router; merge it in for gating + payload.
  const fullData: PrdData = { ...data, productName, authorName }

  const problemDone = isPhaseComplete('problem', fullData, requiredOverrides)
  const solutionDone = isPhaseComplete('solution', fullData, requiredOverrides)
  const risksDone = isPhaseComplete('risks', fullData, requiredOverrides)

  const isLocked = (phase: Phase) => {
    if (phase === 'solution') return !problemDone
    if (phase === 'risks') return !problemDone || !solutionDone
    return false
  }

  const phaseDone: Record<Phase, boolean> = {
    problem: problemDone,
    solution: solutionDone,
    risks: risksDone,
  }

  const allComplete = problemDone && solutionDone && risksDone && ai.ready

  const nextLabel =
    active === 'problem'
      ? 'Solution Space'
      : active === 'solution'
        ? 'Risks & Dependencies'
        : null

  const handleGenerate = () =>
    gen.generate({
      mode: 'full',
      ...fullData,
      requiredOverrides,
      compliance,
      ...ai.payload,
    })

  const complianceFilled = hasComplianceContent(compliance)

  return (
    <div className="flex flex-col gap-6">
      {/* Phase tabs */}
      <div
        role="tablist"
        aria-label="PRD phases"
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
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-primary/40',
                locked && 'cursor-not-allowed opacity-55 hover:border-border',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : done
                      ? 'bg-primary text-primary-foreground'
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
                    isActive
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground',
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
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-card text-foreground hover:border-primary/40',
          )}
        >
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              active === 'compliance'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : complianceFilled
                  ? 'bg-primary text-primary-foreground'
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
                  ? 'text-primary-foreground/80'
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
          missing={getMissingFields(active, fullData, requiredOverrides)}
          nextLabel={nextLabel}
        />
      )}

      {/* Active phase content */}
      <div
        role="tabpanel"
        className="flex flex-col gap-5 rounded-2xl border border-border bg-card/50 p-5 shadow-sm sm:p-7"
      >
        {active !== 'compliance' && (
          <RequiredOverridesControl
            specs={FULL_FIELD_SPECS[active]}
            overrides={requiredOverrides}
            onChange={setRequired}
          />
        )}
        {active === 'problem' && <ProblemPhase data={data} set={set} />}
        {active === 'solution' && <SolutionPhase data={data} set={set} />}
        {active === 'risks' && <RisksPhase data={data} set={set} />}
        {active === 'compliance' && (
          <CompliancePhase data={compliance} onChange={setComplianceField} />
        )}
      </div>

      {ai.section}

      <FormError message={gen.error} />
      <GenerateBar
        ready={allComplete}
        generating={gen.generating}
        hint="Fill in every required field across all three phases to generate your PRD."
        onGenerate={handleGenerate}
      />
    </div>
  )
}
