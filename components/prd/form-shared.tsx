'use client'

import { AlertCircle, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BlockingFields({
  missing,
  nextLabel,
}: {
  missing: string[]
  nextLabel: string | null
}) {
  if (missing.length === 0) return null
  const plural = missing.length > 1 ? 's' : ''
  return (
    <div className="rounded-xl border border-accent bg-accent/40 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
        <AlertCircle className="size-4 shrink-0" />
        {nextLabel ? (
          <span>{`${missing.length} field${plural} still blocking ${nextLabel}`}</span>
        ) : (
          <span>{`${missing.length} required field${plural} remaining`}</span>
        )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {missing.map((field) => (
          <li
            key={field}
            className="rounded-full border border-accent-foreground/20 bg-card px-2.5 py-1 text-xs text-muted-foreground"
          >
            {field}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function GenerateBar({
  ready,
  generating,
  hint,
  onGenerate,
}: {
  ready: boolean
  generating: boolean
  hint: string
  onGenerate: () => void
}) {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
      {!ready && (
        <p className="text-xs text-muted-foreground sm:mr-auto">{hint}</p>
      )}
      <Button
        type="button"
        size="lg"
        disabled={!ready || generating}
        onClick={onGenerate}
        className="h-11 px-6 text-sm"
      >
        {generating ? (
          <>
            <Loader2 className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText />
            Generate Document
          </>
        )}
      </Button>
    </div>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </p>
  )
}
