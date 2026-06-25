'use client'

import { useCallback, useState } from 'react'
import { AlertCircle, Check, FileText, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Field, TextInput } from './fields'
import { ProblemPhase } from './problem-phase'
import { SolutionPhase } from './solution-phase'
import { RisksPhase } from './risks-phase'
import { PrdOutput } from './prd-output'
import {
  getMissingFields,
  initialData,
  isPhaseComplete,
  type Phase,
  type PrdData,
} from './types'

const PHASES: { id: Phase; label: string; n: number }[] = [
  { id: 'problem', label: 'Problem Space', n: 1 },
  { id: 'solution', label: 'Solution Space', n: 2 },
  { id: 'risks', label: 'Risks & Dependencies', n: 3 },
]

export function PrdForm() {
  const [data, setData] = useState<PrdData>(initialData)
  const [active, setActive] = useState<Phase>('problem')
  const [generating, setGenerating] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const set = useCallback(
    <K extends keyof PrdData>(key: K, value: PrdData[K]) =>
      setData((prev) => ({ ...prev, [key]: value })),
    [],
  )

  const problemDone = isPhaseComplete('problem', data)
  const solutionDone = isPhaseComplete('solution', data)
  const risksDone = isPhaseComplete('risks', data)

  // Phase-gating: a tab unlocks only when prior required phases are complete.
  const isLocked = (phase: Phase) => {
    if (phase === 'solution') return !problemDone
    if (phase === 'risks') return !problemDone || !solutionDone
    return false
  }

  const phaseDone: Record<Phase, boolean> = {
    problem: problemDone,
    solution: solutionDone,
    risks: risksDone,
  }

  const allComplete = problemDone && solutionDone && risksDone

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        // Error responses come back as JSON, not a stream.
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Generation failed.')
      }

      if (!res.body) throw new Error('No response stream received.')

      // Switch into the output view and append text as it streams in.
      setMarkdown('')
      setStreaming(true)
      setGenerating(false)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMarkdown(acc)
      }
      acc += decoder.decode()
      setMarkdown(acc)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setMarkdown(null)
    } finally {
      setGenerating(false)
      setStreaming(false)
    }
  }

  if (markdown !== null) {
    return (
      <PrdOutput
        markdown={markdown}
        productName={data.productName}
        streaming={streaming}
        onBack={() => {
          setMarkdown(null)
          setActive('risks')
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Universal header fields */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product / Feature Name" htmlFor="productName" required>
            <TextInput
              id="productName"
              value={data.productName}
              onChange={(e) => set('productName', e.target.value)}
              placeholder="e.g. Smart Inbox"
            />
          </Field>
          <Field label="Author Name" htmlFor="authorName" optional>
            <TextInput
              id="authorName"
              value={data.authorName}
              onChange={(e) => set('authorName', e.target.value)}
              placeholder="Your name"
            />
          </Field>
        </div>
      </div>

      {/* Phase tabs */}
      <div
        role="tablist"
        aria-label="PRD phases"
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
      >
        {PHASES.map((phase) => {
          const locked = isLocked(phase.id)
          const isActive = active === phase.id
          const done = phaseDone[phase.id]
          return (
            <button
              key={phase.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              disabled={locked}
              onClick={() => !locked && setActive(phase.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-primary/40',
                locked && 'cursor-not-allowed opacity-55 hover:border-border',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : done
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {locked ? (
                  <Lock className="size-3.5" />
                ) : done ? (
                  <Check className="size-3.5" />
                ) : (
                  phase.n
                )}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium leading-tight">
                  {phase.label}
                </span>
                <span
                  className={cn(
                    'text-xs',
                    isActive
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground',
                  )}
                >
                  Phase {phase.n}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Blocking-fields indicator for the active phase */}
      {(() => {
        const nextLabel =
          active === 'problem'
            ? 'Solution Space'
            : active === 'solution'
              ? 'Risks & Dependencies'
              : null
        const missing = getMissingFields(active, data)
        if (missing.length === 0) return null
        return (
          <div className="rounded-xl border border-accent bg-accent/40 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
              <AlertCircle className="size-4 shrink-0" />
              {nextLabel ? (
                <span>{`${missing.length} field${missing.length > 1 ? 's' : ''} still blocking ${nextLabel}`}</span>
              ) : (
                <span>{`${missing.length} required field${missing.length > 1 ? 's' : ''} remaining in this phase`}</span>
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
      })()}

      {/* Active phase content */}
      <div
        role="tabpanel"
        className="rounded-2xl border border-border bg-card/50 p-5 shadow-sm sm:p-7"
      >
        {active === 'problem' && <ProblemPhase data={data} set={set} />}
        {active === 'solution' && <SolutionPhase data={data} set={set} />}
        {active === 'risks' && <RisksPhase data={data} set={set} />}
      </div>

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        {!allComplete && (
          <p className="text-xs text-muted-foreground sm:mr-auto">
            Fill in every required field across all three phases to generate
            your PRD.
          </p>
        )}
        <Button
          type="button"
          size="lg"
          disabled={!allComplete || generating}
          onClick={handleGenerate}
          className="h-11 px-6 text-sm"
        >
          {generating ? (
            <>
              <Loader2 className="animate-spin" />
              Generating PRD...
            </>
          ) : (
            <>
              <FileText />
              Generate PRD
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
