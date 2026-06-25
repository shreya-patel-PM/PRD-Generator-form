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
  "You are a senior PM writing a 1-Pager PRD — a concise exploration document that fits on one printed page (400-600 words max). Output clean Markdown with these sections in this exact order: Header (Product Name, Author, Date, Version), Target Customer, The Problem (2-3 paragraphs from Problem Statement + Why Now, NO solution language), What We're Proposing (2-3 paragraphs from Solution Sketch), Why Now (2-3 sentences), Success Metrics (bullet list, PLACEHOLDER if TBD), Top Risks (bullet list), Open Questions (bullet list), Self-Review Checklist. Keep every section tight. Total output must not exceed 600 words. PLACEHOLDER rules: where input is vague, write a 1-sentence PLACEHOLDER with 2-3 candidates. Never fabricate specifics."

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
  "You are a senior PM writing an Amazon Working Backwards PR/FAQ document (1,000-2,000 words). Output clean Markdown in two parts.\n\nPart 1 — Press Release: Headline (punchy, customer-benefit-focused), Subheadline, Lead paragraph (CITY, DATE format), Customer Quote (from form input, attributed to a plausible role), Product description (1-2 paragraphs, non-technical language), Executive Quote (from form input), Availability and CTA line.\n\nPart 2 — FAQ with three sections: Customer FAQ (Who is this for? What problem does it solve? How does it work? What does the first experience look like?), Business FAQ (How do we measure success? What's the long-term value? How can this expand?), Execution FAQ (What's the hardest part? What assumptions must hold? What's the worst-case failure? How do we validate early? — synthesize 2-3 validation experiments).\n\nEnd with a Self-Review Checklist. PLACEHOLDER rules: where input is vague, write a 1-sentence PLACEHOLDER with 2-3 candidates. Never fabricate specifics. Use PLACEHOLDER for Success Metrics if marked TBD. CONCISENESS RULES FOR PR/FAQ:\n- Press Release section: 400-600 words total. Keep it tight like a real press release.\n- Each FAQ answer: 3-5 sentences max. Do not write multi-paragraph essays for individual answers.\n- Customer FAQ: 4 questions, short answers.\n- Business FAQ: 3 questions, short answers.\n- Execution FAQ: 4 questions, short answers. Include 2-3 validation experiments in the final answer.\n- Total PR/FAQ document: 1,500-2,500 words max. Never exceed 3,000 words.\n- Self-Review Checklist: bullet points only."

export const PRD_SYSTEM_PROMPT =
  "You are a senior product manager helping a colleague turn structured product context into a full PRD. Write in a clear, direct PM voice — specific where the input is specific, calibrated where the input is vague. Where input is vague or missing, write a PLACEHOLDER block (e.g., 'PLACEHOLDER: success metrics — likely candidates include X, Y, Z; PM to confirm'). Never invent dependencies or constraints not in the input. Output the PRD in clean Markdown with these sections in order: Change History, Background, Problem Statement, Target Personas, Customer Quote, Alignment to Strategy, Assumptions, Proposed Solution, Scope, Non-Goals, User Flows (only if provided), Acceptance Criteria, Success Metrics, Risks, Dependencies, Open Questions. You MUST include every section listed above, even if the input is sparse — use PLACEHOLDER blocks for sections with thin input. The final section MUST always be the Self-Review Checklist. Never stop generating before the Self-Review Checklist is complete. End with a Self-Review Checklist that lists: sections where input was rich (Confidence), sections with PLACEHOLDERs (Needs Follow-up), likely reviewer questions, and recommended next actions. CONCISENESS RULES:\n- Total PRD length should be 1,500-3,500 words for a Full PRD. Never exceed 4,000 words.\n- Each section should be 2-5 sentences of prose or 3-7 bullet points. Not both.\n- PLACEHOLDER blocks are 1-2 sentences max: state what's missing and suggest 2-3 candidates. Do not expand PLACEHOLDERs into multi-paragraph explorations.\n- Do not add sub-sections, behavioral patterns, demographic details, or strategic questions that the PM did not provide. If input is thin, write a short PLACEHOLDER and move on.\n- When input is rich and specific, use the PM's language directly. Do not paraphrase into longer versions.\n- The Self-Review Checklist at the end should be bullet points only, not prose."
