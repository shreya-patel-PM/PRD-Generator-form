'use client'

import { Field, TextArea, TextInput } from './fields'
import { PersonasBlock } from './personas-block'
import type { PrdData } from './types'

export function ProblemPhase({
  data,
  set,
}: {
  data: PrdData
  set: <K extends keyof PrdData>(key: K, value: PrdData[K]) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <Field
        label="Background"
        htmlFor="background"
        required
        hint="What context led to this work? Set the stage."
      >
        <TextArea
          id="background"
          value={data.background}
          onChange={(e) => set('background', e.target.value)}
          placeholder="Describe the relevant history and context..."
        />
      </Field>

      <Field
        label="Problem Statement"
        htmlFor="problemStatement"
        required
        hint="Do not write solutions here."
      >
        <TextArea
          id="problemStatement"
          value={data.problemStatement}
          onChange={(e) => set('problemStatement', e.target.value)}
          placeholder="What problem are we solving, and for whom?"
        />
      </Field>

      <PersonasBlock
        personas={data.personas}
        onChange={(personas) => set('personas', personas)}
      />

      <Field
        label="Customer Quote"
        htmlFor="customerQuote"
        required
        hint="What would a satisfied customer say?"
      >
        <TextInput
          id="customerQuote"
          value={data.customerQuote}
          onChange={(e) => set('customerQuote', e.target.value)}
          placeholder={'"This finally lets me..."'}
        />
      </Field>

      <Field
        label="Alignment to Strategy"
        htmlFor="alignment"
        required
        hint="How does this connect to broader company goals?"
      >
        <TextArea
          id="alignment"
          value={data.alignment}
          onChange={(e) => set('alignment', e.target.value)}
          placeholder="Tie this work to strategic objectives..."
        />
      </Field>

      <Field
        label="Assumptions"
        htmlFor="assumptions"
        required
        hint="What are we taking for granted that, if wrong, would change the plan?"
      >
        <TextArea
          id="assumptions"
          value={data.assumptions}
          onChange={(e) => set('assumptions', e.target.value)}
          placeholder="List key assumptions..."
        />
      </Field>
    </div>
  )
}
