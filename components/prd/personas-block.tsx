'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, TextArea, TextInput } from './fields'
import { emptyPersona, type Persona } from './types'

export function PersonasBlock({
  personas,
  onChange,
}: {
  personas: Persona[]
  onChange: (personas: Persona[]) => void
}) {
  const update = (id: string, patch: Partial<Persona>) =>
    onChange(personas.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const remove = (id: string) =>
    onChange(personas.filter((p) => p.id !== id))

  const add = () => onChange([...personas, emptyPersona()])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <FieldLabel required>Target Personas</FieldLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Add at least one persona who experiences this problem.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {personas.map((persona, index) => (
          <div
            key={persona.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Persona {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove persona ${index + 1}`}
                onClick={() => remove(persona.id)}
                disabled={personas.length <= 1}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" required>
                <TextInput
                  value={persona.name}
                  onChange={(e) => update(persona.id, { name: e.target.value })}
                  placeholder="e.g. Priya"
                />
              </Field>
              <Field label="Role" required>
                <TextInput
                  value={persona.role}
                  onChange={(e) => update(persona.id, { role: e.target.value })}
                  placeholder="e.g. Operations Manager"
                />
              </Field>
              <Field label="Goals" required>
                <TextArea
                  value={persona.goals}
                  onChange={(e) => update(persona.id, { goals: e.target.value })}
                  placeholder="What are they trying to achieve?"
                  className="min-h-20"
                />
              </Field>
              <Field label="Pain Points" required>
                <TextArea
                  value={persona.painPoints}
                  onChange={(e) =>
                    update(persona.id, { painPoints: e.target.value })
                  }
                  placeholder="What frustrates them today?"
                  className="min-h-20"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus />
          Add persona
        </Button>
      </div>
    </div>
  )
}
