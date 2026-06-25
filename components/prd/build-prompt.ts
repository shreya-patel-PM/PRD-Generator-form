import type { PrdData } from './types'
import type { OnePagerData, PrFaqData } from './modes'

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

// ---------------------------------------------------------------------------
// Mode A — 1-Pager
// ---------------------------------------------------------------------------

export function buildOnePagerPrompt(
  d: OnePagerData,
  header: { productName: string; authorName: string },
): string {
  const v = (x: string) => (x.trim() ? x.trim() : '(not provided)')
  return [
    'Here is the structured context. Generate a concise 1-Pager from it.',
    '',
    `Product / Feature Name: ${v(header.productName)}`,
    `Author: ${v(header.authorName)}`,
    '',
    '## Problem Space',
    `Target Customer: ${v(d.targetCustomer)}`,
    `Problem Statement: ${v(d.problemStatement)}`,
    `Why Now: ${v(d.whyNow)}`,
    '',
    '## Solution Space',
    `Solution Sketch: ${v(d.solutionSketch)}`,
    `Success Metrics: ${v(d.successMetrics)}`,
    '',
    '## Risks',
    `Top Risks: ${v(d.topRisks)}`,
    `Open Questions: ${v(d.openQuestions)}`,
  ].join('\n')
}

export const ONE_PAGER_SYSTEM_PROMPT =
  "You are a senior product manager turning structured context into a crisp 1-Pager that fits on a single page. Write in a clear, direct PM voice. Output clean Markdown with these sections in order: Title, Target Customer, Problem, Why Now, Proposed Solution, Success Metrics, Top Risks, Open Questions. Where input is vague or missing, write a one-line PLACEHOLDER (e.g., 'PLACEHOLDER: success metrics — likely candidates include X, Y; PM to confirm'). Never invent constraints not in the input. CONCISENESS RULES:\n- Total length must stay under 600 words — it must fit on one page.\n- Each section is 1-3 sentences or 2-4 bullet points. Not both.\n- Do not add sub-sections, personas, or detail the PM did not provide.\n- When input is specific, use the PM's language directly; do not pad it.\n- End with a single-line 'Confidence & Follow-ups' note (bullets only) flagging which sections are thin."

// ---------------------------------------------------------------------------
// Mode C — PR/FAQ (Amazon Working Backwards)
// ---------------------------------------------------------------------------

export function buildPrFaqPrompt(
  d: PrFaqData,
  header: { productName: string; authorName: string },
): string {
  const v = (x: string) => (x.trim() ? x.trim() : '(not provided)')
  return [
    'Here is the structured context. Generate an Amazon-style PR/FAQ from it.',
    '',
    `Internal Product / Feature Name: ${v(header.productName)}`,
    `Author: ${v(header.authorName)}`,
    '',
    '## Customer & Problem',
    `Target Customer: ${v(d.targetCustomer)}`,
    `Customer's Current Pain: ${v(d.currentPain)}`,
    `Why Existing Solutions Fail: ${v(d.whyExistingFail)}`,
    '',
    '## Product Vision',
    `Customer-Facing Product Name: ${v(d.productName)}`,
    `Launch Date: ${v(d.launchDate)}`,
    `Key Customer Benefit: ${v(d.keyBenefit)}`,
    `Customer Quote: ${v(d.customerQuote)}`,
    `Executive Quote: ${v(d.executiveQuote)}`,
    '',
    '## Strategic & Execution',
    `Why Now: ${v(d.whyNow)}`,
    `What Needs to Be True: ${v(d.whatMustBeTrue)}`,
    `Hardest Part to Build: ${v(d.hardestPart)}`,
    `Worst-Case Failure: ${v(d.worstCase)}`,
    `Success Metrics: ${v(d.successMetrics)}`,
  ].join('\n')
}

export const PR_FAQ_SYSTEM_PROMPT =
  "You are a senior product manager writing an Amazon-style PR/FAQ using the Working Backwards method. Output clean Markdown in two parts. PART 1 — PRESS RELEASE (write as if already launched, dated with the launch date): a bold headline, a one-line subheadline, a dateline paragraph summarizing the launch, a paragraph on the customer problem, a paragraph on how the product solves it, the customer quote, the executive quote, and a short 'Getting Started' call to action. PART 2 — FAQ: a section of Customer FAQs (benefit, how it works, availability) and a section of Internal/Stakeholder FAQs (why now, what needs to be true, the hardest part to build, worst-case failure, and success metrics). Write in a confident, customer-obsessed voice. Where input is vague or missing, write a one-line PLACEHOLDER and move on; never invent specifics not in the input. CONCISENESS RULES:\n- Press release: 250-400 words. FAQ answers: 1-3 sentences each.\n- Do not add questions the input does not support.\n- Use the PM's exact quotes verbatim — do not rewrite the customer or executive quotes.\n- End with a brief 'Confidence & Follow-ups' checklist (bullets only) flagging thin sections."

export const PRD_SYSTEM_PROMPT =
  "You are a senior product manager helping a colleague turn structured product context into a full PRD. Write in a clear, direct PM voice — specific where the input is specific, calibrated where the input is vague. Where input is vague or missing, write a PLACEHOLDER block (e.g., 'PLACEHOLDER: success metrics — likely candidates include X, Y, Z; PM to confirm'). Never invent dependencies or constraints not in the input. Output the PRD in clean Markdown with these sections in order: Change History, Background, Problem Statement, Target Personas, Customer Quote, Alignment to Strategy, Assumptions, Proposed Solution, Scope, Non-Goals, User Flows (only if provided), Acceptance Criteria, Success Metrics, Risks, Dependencies, Open Questions. You MUST include every section listed above, even if the input is sparse — use PLACEHOLDER blocks for sections with thin input. The final section MUST always be the Self-Review Checklist. Never stop generating before the Self-Review Checklist is complete. End with a Self-Review Checklist that lists: sections where input was rich (Confidence), sections with PLACEHOLDERs (Needs Follow-up), likely reviewer questions, and recommended next actions. CONCISENESS RULES:\n- Total PRD length should be 1,500-3,500 words for a Full PRD. Never exceed 4,000 words.\n- Each section should be 2-5 sentences of prose or 3-7 bullet points. Not both.\n- PLACEHOLDER blocks are 1-2 sentences max: state what's missing and suggest 2-3 candidates. Do not expand PLACEHOLDERs into multi-paragraph explorations.\n- Do not add sub-sections, behavioral patterns, demographic details, or strategic questions that the PM did not provide. If input is thin, write a short PLACEHOLDER and move on.\n- When input is rich and specific, use the PM's language directly. Do not paraphrase into longer versions.\n- The Self-Review Checklist at the end should be bullet points only, not prose."
