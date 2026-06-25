import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Toggle } from './fields'

// A flat map keyed by a field's data key. A present entry is the PM's explicit
// override of that field's required state; an absent entry means "use default".
export type RequiredOverrides = Record<string, boolean>

// Describes a single customizable field within a phase.
export type FieldSpec<T> = {
  key: string
  label: string
  defaultRequired: boolean
  isFilled: (data: T) => boolean
}

// Resolves the effective required state: the PM's override if set, else default.
export function resolveRequired<T>(
  spec: FieldSpec<T>,
  overrides: RequiredOverrides,
): boolean {
  return overrides[spec.key] ?? spec.defaultRequired
}

// True when every effectively-required field in the set is filled.
export function specsComplete<T>(
  specs: FieldSpec<T>[],
  data: T,
  overrides: RequiredOverrides,
): boolean {
  return specs.every(
    (s) => !resolveRequired(s, overrides) || s.isFilled(data),
  )
}

// Labels of effectively-required fields that are still empty.
export function specsMissing<T>(
  specs: FieldSpec<T>[],
  data: T,
  overrides: RequiredOverrides,
): string[] {
  return specs
    .filter((s) => resolveRequired(s, overrides) && !s.isFilled(data))
    .map((s) => s.label)
}

// The expandable "Customize required fields" control shown atop each phase.
export function RequiredOverridesControl<T>({
  specs,
  overrides,
  onChange,
}: {
  specs: FieldSpec<T>[]
  overrides: RequiredOverrides
  onChange: (key: string, required: boolean) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <SlidersHorizontal className="size-3.5" />
        Customize required fields
      </button>

      {open && (
        <ul className="flex flex-col gap-1 border-t border-border px-3 py-2">
          {specs.map((spec) => {
            const required = resolveRequired(spec, overrides)
            return (
              <li
                key={spec.key}
                className="flex items-center justify-between gap-3 py-1"
              >
                <span className="text-sm text-foreground">{spec.label}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      required
                        ? 'text-xs font-medium text-primary'
                        : 'text-xs text-muted-foreground'
                    }
                  >
                    {required ? 'Required' : 'Optional'}
                  </span>
                  <Toggle
                    checked={required}
                    onChange={(next) => onChange(spec.key, next)}
                    label={`Mark ${spec.label} as ${required ? 'optional' : 'required'}`}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
