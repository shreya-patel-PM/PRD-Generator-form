import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import type { Criterion, Persona, PrdData } from '@/components/prd/types'

// Avoid the edge runtime when using the AI SDK.
export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are a senior product manager helping a colleague turn structured product context into a full PRD. Write in a clear, direct PM voice — specific where the input is specific, calibrated where the input is vague. Where input is vague or missing, write a PLACEHOLDER block (e.g., 'PLACEHOLDER: success metrics — likely candidates include X, Y, Z; PM to confirm'). Never invent dependencies or constraints not in the input. Output the PRD in clean Markdown with these sections in order: Change History, Background, Problem Statement, Target Personas, Customer Quote, Alignment to Strategy, Assumptions, Proposed Solution, Scope, Non-Goals, User Flows (only if provided), Acceptance Criteria, Success Metrics, Risks, Dependencies, Open Questions. End with a Self-Review Checklist that lists: sections where input was rich (Confidence), sections with PLACEHOLDERs (Needs Follow-up), likely reviewer questions, and recommended next actions.`

function field(label: string, value: string | undefined): string {
  const v = (value ?? '').trim()
  return `${label}:\n${v.length > 0 ? v : '(not provided)'}\n`
}

function buildUserMessage(d: PrdData): string {
  const personas = (d.personas ?? [])
    .filter((p: Persona) => p.name || p.role || p.goals || p.painPoints)
    .map(
      (p: Persona, i: number) =>
        `  Persona ${i + 1}: ${p.name || '(unnamed)'} — ${p.role || '(no role)'}\n    Goals: ${p.goals || '(not provided)'}\n    Pain Points: ${p.painPoints || '(not provided)'}`,
    )
    .join('\n')

  const criteria = (d.criteria ?? [])
    .filter((c: Criterion) => c.persona || c.action || c.outcome)
    .map(
      (c: Criterion) =>
        `  - As a ${c.persona || '[persona]'}, I can ${c.action || '[action]'} so that ${c.outcome || '[outcome]'}.`,
    )
    .join('\n')

  return [
    'Generate a complete PRD from the structured product context below.',
    '',
    field('Product / Feature Name', d.productName),
    field('Author', d.authorName),
    '== PROBLEM SPACE ==',
    field('Background', d.background),
    field('Problem Statement', d.problemStatement),
    `Target Personas:\n${personas || '(not provided)'}\n`,
    field('Customer Quote', d.customerQuote),
    field('Alignment to Strategy', d.alignment),
    field('Assumptions', d.assumptions),
    '== SOLUTION SPACE ==',
    field('Proposed Solution', d.proposedSolution),
    field('Scope', d.scope),
    field('Non-Goals', d.nonGoals),
    field('User Flows', d.userFlows),
    `Acceptance Criteria:\n${criteria || '(not provided)'}\n`,
    field('Success Metrics', d.successMetrics),
    '== RISKS & DEPENDENCIES ==',
    field('Risks', d.risks),
    field('Dependencies', d.dependencies),
    field('Open Questions', d.openQuestions),
  ].join('\n')
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured.' },
      { status: 500 },
    )
  }

  let data: PrdData
  try {
    data = (await req.json()) as PrdData
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5'),
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(data) }],
      maxOutputTokens: 4000,
    })

    return Response.json({ markdown: text })
  } catch (err) {
    console.log('[v0] PRD generation error:', err)
    return Response.json(
      { error: 'Failed to generate PRD. Please try again.' },
      { status: 502 },
    )
  }
}
