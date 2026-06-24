'use client'

import { CriteriaBlock } from './criteria-block'
import { Field, TextArea } from './fields'
import type { PrdData } from './types'

export function SolutionPhase({
  data,
  set,
}: {
  data: PrdData
  set: <K extends keyof PrdData>(key: K, value: PrdData[K]) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <Field
        label="Proposed Solution"
        htmlFor="proposedSolution"
        required
        hint="Describe your recommended approach at a high level."
      >
        <TextArea
          id="proposedSolution"
          value={data.proposedSolution}
          onChange={(e) => set('proposedSolution', e.target.value)}
          placeholder="How will we solve the problem?"
        />
      </Field>

      <Field
        label="Scope"
        htmlFor="scope"
        required
        hint="What is included in this effort?"
      >
        <TextArea
          id="scope"
          value={data.scope}
          onChange={(e) => set('scope', e.target.value)}
          placeholder="Define what's in scope..."
        />
      </Field>

      <Field
        label="Non-Goals"
        htmlFor="nonGoals"
        required
        hint="What are we deliberately not building, and why?"
      >
        <TextArea
          id="nonGoals"
          value={data.nonGoals}
          onChange={(e) => set('nonGoals', e.target.value)}
          placeholder="List explicit non-goals..."
        />
      </Field>

      <Field
        label="User Flows"
        htmlFor="userFlows"
        optional
        hint="Walk through the key paths a user takes."
      >
        <TextArea
          id="userFlows"
          value={data.userFlows}
          onChange={(e) => set('userFlows', e.target.value)}
          placeholder="Describe primary user flows..."
        />
      </Field>

      <CriteriaBlock
        criteria={data.criteria}
        onChange={(criteria) => set('criteria', criteria)}
      />

      <Field
        label="Success Metrics"
        htmlFor="successMetrics"
        required
        hint='How will we measure success? You can type "TBD" if not yet defined.'
      >
        <TextArea
          id="successMetrics"
          value={data.successMetrics}
          onChange={(e) => set('successMetrics', e.target.value)}
          placeholder="e.g. 20% reduction in support tickets, or TBD"
        />
      </Field>
    </div>
  )
}
