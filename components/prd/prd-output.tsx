'use client'

import { useState } from 'react'
import { ArrowLeft, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PrdData } from './types'

function buildMarkdown(d: PrdData): string {
  const lines: string[] = []
  lines.push(`# ${d.productName || 'Untitled Product'}`)
  if (d.authorName.trim()) lines.push(`_Author: ${d.authorName}_`)
  lines.push('')

  lines.push('## Problem Space', '')
  lines.push('### Background', d.background, '')
  lines.push('### Problem Statement', d.problemStatement, '')
  lines.push('### Target Personas', '')
  d.personas.forEach((p, i) => {
    lines.push(`**${i + 1}. ${p.name || 'Unnamed'} — ${p.role}**`)
    lines.push(`- Goals: ${p.goals}`)
    lines.push(`- Pain Points: ${p.painPoints}`, '')
  })
  lines.push('### Customer Quote', `> ${d.customerQuote}`, '')
  lines.push('### Alignment to Strategy', d.alignment, '')
  lines.push('### Assumptions', d.assumptions, '')

  lines.push('## Solution Space', '')
  lines.push('### Proposed Solution', d.proposedSolution, '')
  lines.push('### Scope', d.scope, '')
  lines.push('### Non-Goals', d.nonGoals, '')
  if (d.userFlows.trim()) lines.push('### User Flows', d.userFlows, '')
  lines.push('### Acceptance Criteria', '')
  d.criteria
    .filter((c) => c.persona.trim() || c.action.trim() || c.outcome.trim())
    .forEach((c) => {
      lines.push(`- As a ${c.persona}, I can ${c.action} so that ${c.outcome}.`)
    })
  lines.push('')
  lines.push('### Success Metrics', d.successMetrics, '')

  lines.push('## Risks & Dependencies', '')
  lines.push('### Risks', d.risks, '')
  lines.push('### Dependencies', d.dependencies, '')
  lines.push('### Open Questions', d.openQuestions, '')

  return lines.join('\n')
}

export function PrdOutput({
  data,
  onBack,
}: {
  data: PrdData
  onBack: () => void
}) {
  const [copied, setCopied] = useState(false)
  const markdown = buildMarkdown(data)

  const copy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft />
          Back to editor
        </Button>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check /> : <Copy />}
          {copied ? 'Copied' : 'Copy markdown'}
        </Button>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <pre className="font-mono text-[0.8rem] leading-relaxed whitespace-pre-wrap text-card-foreground">
          {markdown}
        </pre>
      </div>
    </div>
  )
}
