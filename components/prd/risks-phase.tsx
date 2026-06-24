'use client'

import { Field, TextArea } from './fields'
import type { PrdData } from './types'

export function RisksPhase({
  data,
  set,
}: {
  data: PrdData
  set: <K extends keyof PrdData>(key: K, value: PrdData[K]) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <Field
        label="Risks"
        htmlFor="risks"
        required
        hint="What could go wrong, and how likely or severe is it?"
      >
        <TextArea
          id="risks"
          value={data.risks}
          onChange={(e) => set('risks', e.target.value)}
          placeholder="List risks and mitigations..."
        />
      </Field>

      <Field
        label="Dependencies"
        htmlFor="dependencies"
        required
        hint="What other teams, systems, or work does this rely on?"
      >
        <TextArea
          id="dependencies"
          value={data.dependencies}
          onChange={(e) => set('dependencies', e.target.value)}
          placeholder="List dependencies..."
        />
      </Field>

      <Field
        label="Open Questions"
        htmlFor="openQuestions"
        required
        hint="What still needs to be decided or investigated?"
      >
        <TextArea
          id="openQuestions"
          value={data.openQuestions}
          onChange={(e) => set('openQuestions', e.target.value)}
          placeholder="List unresolved questions..."
        />
      </Field>
    </div>
  )
}
