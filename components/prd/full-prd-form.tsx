'use client'

import { useCallback, useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BlockingFields, FormError, GenerateBar } from './form-shared'
import { ProblemPhase } from './problem-phase'
import { SolutionPhase } from './solution-phase'
import { RisksPhase } from './risks-phase'
import {
  getMissingFields,
  initialData,
  isPhaseComplete,
  type Phase,
  type PrdData,
} from './types'
import type { PrdGeneration } from './use-prd-generation'
import type { AiFeatureControls } from './ai-feature'

const PHASES: { id: Phase; label: string; n: number }[] = [
  { id: 'problem', label: 'Problem Space', n: 1 },
  { id: 'solution', label: 'Solution Space', n: 2 },
  { id: 'risks', label: 'Risks & Dependencies', n: 3 },
]

export function FullPrdForm({
  productName,
  authorName,
  gen,
  ai,
}: {
  productName: string
  authorName: string
  gen: PrdGeneration
  ai: AiFeatureControls
}) {
  const [data, setData] = useState<PrdData>(initialData)
  const [active, setActive] = useState<Phase>('problem')

  const set = useCallback(
    <K extends keyof PrdData>(key: K, value: PrdData[K]) =>
      setData((prev) => ({ ...prev, [key]: value })),
    [],
  )

  // The universal header lives in the router; merge it in for gating + payload.
  const fullData: PrdData = { ...data, productName, authorName }

  const problemDone = isPhaseComplete('problem', fullData)
  const solutionDone = isPhaseComplete('solution', fullData)
  const risksDone = isPhaseComplete('risks', fullData)

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

  const allComplete = problemDone && solutionDone && risksDone && ai.ready

  const nextLabel =
    active === 'problem'
      ? 'Solution Space'
      : active === 'solution'
        ? 'Risks & Dependencies'
        : null

  const handleGenerate = () =>
    gen.generate({ mode: 'full', ...fullData, ...ai.payload })

  return (
    <div className="flex flex-col gap-6">
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

      <BlockingFields
        missing={getMissingFields(active, fullData)}
        nextLabel={nextLabel}
      />

      {/* Active phase content */}
      <div
        role="tabpanel"
        className="rounded-2xl border border-border bg-card/50 p-5 shadow-sm sm:p-7"
      >
        {active === 'problem' && <ProblemPhase data={data} set={set} />}
        {active === 'solution' && <SolutionPhase data={data} set={set} />}
        {active === 'risks' && <RisksPhase data={data} set={set} />}
      </div>

      {ai.section}

      <FormError message={gen.error} />
      <GenerateBar
        ready={allComplete}
        generating={gen.generating}
        hint="Fill in every required field across all three phases to generate your PRD."
        onGenerate={handleGenerate}
      />
    </div>
  )
}
