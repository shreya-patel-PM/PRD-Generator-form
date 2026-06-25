'use client'

import { useCallback, useState } from 'react'
import { Field, TextArea, TextInput } from './fields'
import { FormError, GenerateBar } from './form-shared'
import {
  initialOnePager,
  isOnePagerComplete,
  type OnePagerData,
} from './modes'
import type { PrdGeneration } from './use-prd-generation'

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
}: {
  productName: string
  authorName: string
  gen: PrdGeneration
}) {
  const [data, setData] = useState<OnePagerData>(initialOnePager)

  const set = useCallback(
    <K extends keyof OnePagerData>(key: K, value: OnePagerData[K]) =>
      setData((prev) => ({ ...prev, [key]: value })),
    [],
  )

  const ready = isOnePagerComplete(data)

  const handleGenerate = () =>
    gen.generate({ mode: 'one-pager', productName, authorName, ...data })

  return (
    <div className="flex flex-col gap-6">
      {/* All phases visible at once — no gating for the 1-Pager. */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card/50 p-5 shadow-sm sm:p-7">
        <PhaseHeading n={1} title="Problem Space" />
        <Field
          label="Target Customer"
          htmlFor="op-targetCustomer"
          required
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
          required
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
          required
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
        <Field
          label="Solution Sketch"
          htmlFor="op-solutionSketch"
          required
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
          required
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
        <Field label="Top Risks" htmlFor="op-topRisks" required>
          <TextArea
            id="op-topRisks"
            value={data.topRisks}
            onChange={(e) => set('topRisks', e.target.value)}
            placeholder="What could go wrong?"
          />
        </Field>
        <Field label="Open Questions" htmlFor="op-openQuestions" required>
          <TextArea
            id="op-openQuestions"
            value={data.openQuestions}
            onChange={(e) => set('openQuestions', e.target.value)}
            placeholder="What still needs to be decided?"
          />
        </Field>
      </section>

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
