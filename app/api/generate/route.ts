import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import type { PrdData } from '@/components/prd/types'

export const maxDuration = 60

const SYSTEM_PROMPT =
  "You are a senior product manager helping a colleague turn structured product context into a full PRD. Write in a clear, direct PM voice — specific where the input is specific, calibrated where the input is vague. Where input is vague or missing, write a PLACEHOLDER block (e.g., 'PLACEHOLDER: success metrics — likely candidates include X, Y, Z; PM to confirm'). Never invent dependencies or constraints not in the input. Output the PRD in clean Markdown with these sections in order: Change History, Background, Problem Statement, Target Personas, Customer Quote, Alignment to Strategy, Assumptions, Proposed Solution, Scope, Non-Goals, User Flows (only if provided), Acceptance Criteria, Success Metrics, Risks, Dependencies, Open Questions. End with a Self-Review Checklist that lists: sections where input was rich (Confidence), sections with PLACEHOLDERs (Needs Follow-up), likely reviewer questions, and recommended next actions."

function buildUserMessage(d: PrdData): string {
  const section = (label: string, value: string) =>
    `## ${label}\n${value.trim() ? value.trim() : '(not provided)'}`

  const personas =
    d.personas.length === 0
      ? '(not provided)'
      : d.personas
          .map(
            (p, i) =>
              `Persona ${i + 1}:\n- Name: ${p.name || '(not provided)'}\n- Role: ${p.role || '(not provided)'}\n- Goals: ${p.goals || '(not provided)'}\n- Pain points: ${p.painPoints || '(not provided)'}`,
          )
          .join('\n\n')

  const criteria =
    d.criteria.filter((c) => c.persona || c.action || c.outcome).length === 0
      ? '(not provided)'
      : d.criteria
          .filter((c) => c.persona || c.action || c.outcome)
          .map(
            (c) =>
              `- As a ${c.persona || '[persona]'}, I can ${c.action || '[action]'} so that ${c.outcome || '[outcome]'}.`,
          )
          .join('\n')

  return [
    `Generate a complete PRD from the following structured input.`,
    ``,
    `# Header`,
    `- Product / Feature Name: ${d.productName || '(not provided)'}`,
    `- Author: ${d.authorName || '(not provided)'}`,
    ``,
    `# Phase 1 — Problem Space`,
    section('Background', d.background),
    section('Problem Statement', d.problemStatement),
    `## Target Personas\n${personas}`,
    section('Customer Quote', d.customerQuote),
    section('Alignment to Strategy', d.alignment),
    section('Assumptions', d.assumptions),
    ``,
    `# Phase 2 — Solution Space`,
    section('Proposed Solution', d.proposedSolution),
    section('Scope', d.scope),
    section('Non-Goals', d.nonGoals),
    section('User Flows', d.userFlows),
    `## Acceptance Criteria\n${criteria}`,
    section('Success Metrics', d.successMetrics),
    ``,
    `# Phase 3 — Risks & Dependencies`,
    section('Risks', d.risks),
    section('Dependencies', d.dependencies),
    section('Open Questions', d.openQuestions),
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
      { status: 500 },
    )
  }
}
