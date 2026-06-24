import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function FieldLabel({
  htmlFor,
  children,
  required,
  optional,
}: {
  htmlFor?: string
  children: ReactNode
  required?: boolean
  optional?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-sm font-medium text-foreground"
    >
      {children}
      {required && (
        <span className="text-primary" aria-hidden="true">
          *
        </span>
      )}
      {optional && (
        <span className="text-xs font-normal text-muted-foreground">
          (optional)
        </span>
      )}
    </label>
  )
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
}

const fieldBase =
  'w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none'

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, 'h-10', className)} {...props} />
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldBase, 'min-h-24 resize-y leading-relaxed', className)}
      {...props}
    />
  )
}

export function Field({
  label,
  htmlFor,
  required,
  optional,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  optional?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor={htmlFor} required={required} optional={optional}>
        {label}
      </FieldLabel>
      {hint && <FieldHint>{hint}</FieldHint>}
      {children}
    </div>
  )
}
