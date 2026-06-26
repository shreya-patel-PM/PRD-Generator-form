'use client'

import { useCallback, useEffect, useState } from 'react'
import { Field, TextArea, TextInput } from './fields'
import { FormError, GenerateBar } from './form-shared'
import {
  initialOnePager,
  isOnePagerComplete,
  ONE_PAGER_FIELD_SPECS,
  type OnePagerData,
} from './modes'
import {
  RequiredOverridesControl,
  type RequiredOverrides,
} from './required-overrides'
import type { PrdGeneration } from './use-prd-generation'
import type { AiFeatureControls } from './ai-feature'

function PhaseHeading({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-mode-one-pager text-xs font-semibold text-card">
        {n}
      </span>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  )
}

export function OnePagerForm({
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
  const [data, setData] = useState<OnePagerData>(initialOnePager)
  const [requiredOverrides, setRequiredOverrides] = useState<RequiredOverrides>(
    {},
  )

  // Report whether any mode-specific field holds content, so the router can
  // warn before a mode switch clears it.
  useEffect(() => {
    onDirtyChange?.(Object.values(data).some((v) => v.trim().length > 0))
  }, [data, onDirtyChange])

  const set = useCallback(
    <K extends keyof OnePagerData>(key: K, value: OnePagerData[K]) =>
      setData((prev) => ({ ...prev, [key]: value })),
    [],
  )

  const setRequired = useCallback(
    (key: string, required: boolean) =>
      setRequiredOverrides((prev) => ({ ...prev, [key]: required })),
    [],
  )

  // All 1-Pager fields default to required, so the effective state is simply
  // the override when present.
  const req = (key: string) => requiredOverrides[key] ?? true

  const ready = isOnePagerComplete(data, requiredOverrides) && ai.ready

  const handleGenerate = () =>
    gen.generate({
      mode: 'one-pager',
      productName,
      authorName,
      ...data,
      requiredOverrides,
      ...ai.payload,
    })

  return (
    <div className="flex flex-col gap-6">
      {/* All phases visible at once — no gating for the 1-Pager. */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card/50 p-5 shadow-sm sm:p-7">
        <PhaseHeading n={1} title="Problem Space" />
        <RequiredOverridesControl
          specs={ONE_PAGER_FIELD_SPECS.problem}
          overrides={requiredOverrides}
          onChange={setRequired}
        />
        <Field
          label="Target Customer"
          htmlFor="op-targetCustomer"
          required={req('targetCustomer')}
          optional={!req('targetCustomer')}
          hint="Who is this for, in one sentence"
        >
          <TextInput
            id="op-targetCustomer"
            value={data.targetCustomer}
            onChange={(e) => set('targetCustomer', e.target.value)}
            placeholder="e.g. Solo founders managing their own support"
          />
        </Field>
        <Field
          label="Problem Statement"
          htmlFor="op-problemStatement"
          required={req('problemStatement')}
          optional={!req('problemStatement')}
          hint="What problem are they experiencing? Don't write the solution here."
        >
          <TextArea
            id="op-problemStatement"
            value={data.problemStatement}
            onChange={(e) => set('problemStatement', e.target.value)}
            placeholder="Describe the problem..."
          />
        </Field>
        <Field
          label="Why Now?"
          htmlFor="op-whyNow"
          required={req('whyNow')}
          optional={!req('whyNow')}
          hint="Why is this the right time to solve it?"
        >
          <TextArea
            id="op-whyNow"
            value={data.whyNow}
            onChange={(e) => set('whyNow', e.target.value)}
            placeholder="What changed to make this urgent?"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card/50 p-5 shadow-sm sm:p-7">
        <PhaseHeading n={2} title="Solution Space" />
        <RequiredOverridesControl
          specs={ONE_PAGER_FIELD_SPECS.solution}
          overrides={requiredOverrides}
          onChange={setRequired}
        />
        <Field
          label="Solution Sketch"
          htmlFor="op-solutionSketch"
          required={req('solutionSketch')}
          optional={!req('solutionSketch')}
          hint="How does it work? Don't over-detail."
        >
          <TextArea
            id="op-solutionSketch"
            value={data.solutionSketch}
            onChange={(e) => set('solutionSketch', e.target.value)}
            placeholder="A high-level sketch of the approach..."
          />
        </Field>
        <Field
          label="Success Metrics"
          htmlFor="op-successMetrics"
          required={req('successMetrics')}
          optional={!req('successMetrics')}
          hint="What would success look like? Type TBD if unsure."
        >
          <TextArea
            id="op-successMetrics"
            value={data.successMetrics}
            onChange={(e) => set('successMetrics', e.target.value)}
            placeholder="e.g. 30% faster resolution, or TBD"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card/50 p-5 shadow-sm sm:p-7">
        <PhaseHeading n={3} title="Risks" />
        <RequiredOverridesControl
          specs={ONE_PAGER_FIELD_SPECS.risks}
          overrides={requiredOverrides}
          onChange={setRequired}
        />
        <Field
          label="Top Risks"
          htmlFor="op-topRisks"
          required={req('topRisks')}
          optional={!req('topRisks')}
        >
          <TextArea
            id="op-topRisks"
            value={data.topRisks}
            onChange={(e) => set('topRisks', e.target.value)}
            placeholder="What could go wrong?"
          />
        </Field>
        <Field
          label="Open Questions"
          htmlFor="op-openQuestions"
          required={req('openQuestions')}
          optional={!req('openQuestions')}
        >
          <TextArea
            id="op-openQuestions"
            value={data.openQuestions}
            onChange={(e) => set('openQuestions', e.target.value)}
            placeholder="What still needs to be decided?"
          />
        </Field>
      </section>

      {ai.section}

      <FormError message={gen.error} />
      <GenerateBar
        ready={ready}
        generating={gen.generating}
        hint="Fill in all seven fields to generate your 1-Pager."
        onGenerate={handleGenerate}
      />
    </div>
  )
}
