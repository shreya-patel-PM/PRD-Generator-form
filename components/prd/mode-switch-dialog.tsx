'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ModeSwitchDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const confirmRef = useRef<HTMLDivElement>(null)

  // Move focus to the confirm button and wire up Escape-to-cancel while open.
  useEffect(() => {
    if (!open) return
    confirmRef.current
      ?.querySelector<HTMLButtonElement>('[data-confirm]')
      ?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-switch-title"
      aria-describedby="mode-switch-desc"
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Cancel mode switch"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/40"
      />

      {/* Panel */}
      <div
        ref={confirmRef}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mode-one-pager/15 text-mode-one-pager">
            <AlertTriangle className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2
              id="mode-switch-title"
              className="text-base font-semibold text-foreground"
            >
              Switch document type?
            </h2>
            <p
              id="mode-switch-desc"
              className="text-sm leading-relaxed text-muted-foreground"
            >
              Switching modes will clear fields that don&apos;t exist in the new
              mode. Fields shared between modes (like Product Name and Author)
              will be preserved.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button data-confirm size="sm" onClick={onConfirm}>
            Switch
          </Button>
        </div>
      </div>
    </div>
  )
}
