'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODES, type Mode } from './modes'

export function ModeSelector({
  mode,
  onChange,
}: {
  mode: Mode
  onChange: (mode: Mode) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-foreground">
        Document type
      </legend>
      <div
        role="radiogroup"
        aria-label="Document type"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {MODES.map((m) => {
          const selected = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(m.id)}
              className={cn(
                'relative flex flex-col gap-1 rounded-xl border bg-card p-4 text-left transition-colors',
                selected
                  ? cn(m.accentBorder, m.accentBg, 'shadow-sm')
                  : 'border-border hover:border-foreground/20',
              )}
            >
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className={cn('size-2.5 rounded-full', m.accentDot)}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {m.label}
                  </span>
                </span>
                {selected && (
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full text-card',
                      m.accentDot,
                    )}
                  >
                    <Check className="size-3" />
                  </span>
                )}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {m.subtitle}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
