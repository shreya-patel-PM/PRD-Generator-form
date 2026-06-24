'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, TextInput } from './fields'
import { emptyCriterion, type Criterion } from './types'

export function CriteriaBlock({
  criteria,
  onChange,
}: {
  criteria: Criterion[]
  onChange: (criteria: Criterion[]) => void
}) {
  const update = (id: string, patch: Partial<Criterion>) =>
    onChange(criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const remove = (id: string) => onChange(criteria.filter((c) => c.id !== id))

  const add = () => onChange([...criteria, emptyCriterion()])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <FieldLabel required>Acceptance Criteria</FieldLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Provide at least three. Format: As a [persona], I can [action] so that
          [outcome].
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {criteria.map((c, index) => (
          <div
            key={c.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Criterion {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove criterion ${index + 1}`}
                onClick={() => remove(c.id)}
                disabled={criteria.length <= 3}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>As a</span>
              <TextInput
                value={c.persona}
                onChange={(e) => update(c.id, { persona: e.target.value })}
                placeholder="persona"
                className="h-9 w-40 flex-1"
                aria-label="Persona"
              />
              <span>, I can</span>
              <TextInput
                value={c.action}
                onChange={(e) => update(c.id, { action: e.target.value })}
                placeholder="action"
                className="h-9 w-48 flex-1"
                aria-label="Action"
              />
              <span>so that</span>
              <TextInput
                value={c.outcome}
                onChange={(e) => update(c.id, { outcome: e.target.value })}
                placeholder="outcome"
                className="h-9 w-48 flex-1"
                aria-label="Outcome"
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus />
          Add criterion
        </Button>
      </div>
    </div>
  )
}
