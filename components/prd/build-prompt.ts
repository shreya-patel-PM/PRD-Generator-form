import type { PrdData } from './types'

// Turns the structured form state into a readable, labeled context block
// for the model. Empty fields are explicitly marked so the model knows
// where to insert PLACEHOLDER guidance instead of inventing content.
export function buildUserPrompt(d: PrdData): string {
  const val = (v: string) => (v.trim() ? v.trim() : '(not provided)')

  const personas =
    d.personas.length === 0
      ? '(none provided)'
      : d.personas
          .map((p, i) => {
            return [
              `Persona ${i + 1}:`,
              `  - Name: ${val(p.name)}`,
              `  - Role: ${val(p.role)}`,
              `  - Goals: ${val(p.goals)}`,
              `  - Pain points: ${val(p.painPoints)}`,
            ].join('\n')
          })
          .join('\n')

  const criteria =
    d.criteria.filter((c) => c.persona || c.action || c.outcome).length === 0
      ? '(none provided)'
      : d.criteria
          .filter((c) => c.persona || c.action || c.outcome)
          .map(
            (c) =>
              `  - As a ${val(c.persona)}, I can ${val(c.action)} so that ${val(c.outcome)}.`,
          )
          .join('\n')

  return [
    'Here is the structured product context. Generate the full PRD from it.',
    '',
    `Product / Feature Name: ${val(d.productName)}`,
    `Author: ${val(d.authorName)}`,
    '',
    '## Problem Space',
    `Background: ${val(d.background)}`,
    `Problem Statement: ${val(d.problemStatement)}`,
    'Target Personas:',
    personas,
    `Customer Quote: ${val(d.customerQuote)}`,
    `Alignment to Strategy: ${val(d.alignment)}`,
    `Assumptions: ${val(d.assumptions)}`,
    '',
    '## Solution Space',
    `Proposed Solution: ${val(d.proposedSolution)}`,
    `Scope: ${val(d.scope)}`,
    `Non-Goals: ${val(d.nonGoals)}`,
    `User Flows: ${val(d.userFlows)}`,
    'Acceptance Criteria:',
    criteria,
    `Success Metrics: ${val(d.successMetrics)}`,
    '',
    '## Risks & Dependencies',
    `Risks: ${val(d.risks)}`,
    `Dependencies: ${val(d.dependencies)}`,
    `Open Questions: ${val(d.openQuestions)}`,
  ].join('\n')
}

export const PRD_SYSTEM_PROMPT =
  "You are a senior product manager helping a colleague turn structured product context into a full PRD. Write in a clear, direct PM voice — specific where the input is specific, calibrated where the input is vague. Where input is vague or missing, write a PLACEHOLDER block (e.g., 'PLACEHOLDER: success metrics — likely candidates include X, Y, Z; PM to confirm'). Never invent dependencies or constraints not in the input. Output the PRD in clean Markdown with these sections in order: Change History, Background, Problem Statement, Target Personas, Customer Quote, Alignment to Strategy, Assumptions, Proposed Solution, Scope, Non-Goals, User Flows (only if provided), Acceptance Criteria, Success Metrics, Risks, Dependencies, Open Questions. You MUST include every section listed above, even if the input is sparse — use PLACEHOLDER blocks for sections with thin input. The final section MUST always be the Self-Review Checklist. Never stop generating before the Self-Review Checklist is complete. End with a Self-Review Checklist that lists: sections where input was rich (Confidence), sections with PLACEHOLDERs (Needs Follow-up), likely reviewer questions, and recommended next actions."
