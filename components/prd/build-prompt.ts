import type { PrdData } from './types'
import type { Mode, OnePagerData, PrFaqData } from './modes'
import type { AiFeatureData } from './ai-feature'

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

// ---------------------------------------------------------------------------
// AI Feature addendum — shared across all three modes when enabled
// ---------------------------------------------------------------------------

export function serializeAiFeature(d: AiFeatureData): string {
  const v = (x: string) => (x.trim() ? x.trim() : '(not provided)')

  const alternatives =
    d.alternatives.filter((a) => a.modelName || a.whyRejected).length === 0
      ? '(none provided)'
      : d.alternatives
          .filter((a) => a.modelName || a.whyRejected)
          .map((a) => `  - ${v(a.modelName)} — rejected because: ${v(a.whyRejected)}`)
          .join('\n')

  const failureModes =
    d.failureModes.filter((f) => f.name || f.expectedRate || f.userImpact)
      .length === 0
      ? '(none provided)'
      : d.failureModes
          .filter((f) => f.name || f.expectedRate || f.userImpact)
          .map(
            (f) =>
              `  - ${v(f.name)} | expected rate: ${v(f.expectedRate)} | user impact: ${v(f.userImpact)}`,
          )
          .join('\n')

  const reviewers =
    d.reviewers.filter((r) => r.team || r.date || r.status).length === 0
      ? '(none provided)'
      : d.reviewers
          .filter((r) => r.team || r.date || r.status)
          .map((r) => `  - ${v(r.team)} | ${v(r.date)} | ${v(r.status)}`)
          .join('\n')

  const rolloutSteps =
    d.rolloutSteps.filter((s) => s.name || s.duration || s.gateMetric || s.escalation)
      .length === 0
      ? '(none provided)'
      : d.rolloutSteps
          .filter((s) => s.name || s.duration || s.gateMetric || s.escalation)
          .map(
            (s) =>
              `  - ${v(s.name)} | duration: ${v(s.duration)} | gate metric: ${v(s.gateMetric)} | escalation: ${v(s.escalation)}`,
          )
          .join('\n')

  const trainingData = d.usesTrainingData
    ? [
        'Uses additional training/RAG data: Yes',
        `  - Data Sources: ${v(d.dataSources)}`,
        `  - License/Consent Basis: ${v(d.licenseBasis)}`,
        `  - PII Handling: ${v(d.piiHandling)}`,
        `  - Retention Policy: ${v(d.retentionPolicy)}`,
        `  - Deletion Mechanism: ${v(d.deletionMechanism)}`,
      ].join('\n')
    : 'Uses additional training/RAG data: No — foundation model only.'

  return [
    '',
    '## AI FEATURE DETAILS (generate the 8 AI sections from this)',
    '',
    '### 1. Model Selection Rationale',
    `Model Class: ${v(d.modelClass)}`,
    `Specific Model: ${v(d.specificModel)}`,
    'Alternatives Considered:',
    alternatives,
    `Decision Criteria: ${v(d.decisionCriteria)}`,
    '',
    '### 2. Eval Plan',
    `Test Set Description: ${v(d.testSet)}`,
    `Offline Metrics & Targets: ${v(d.offlineMetrics)}`,
    `Pass Threshold: ${v(d.passThreshold)}`,
    `Online Signals & A/B Plan: ${v(d.onlineSignals)}`,
    '',
    '### 3. Hallucination & Failure Modes',
    'Failure Modes:',
    failureModes,
    `Worst-Case Failure: ${v(d.worstCaseFailure)}`,
    `Detection Mechanism: ${v(d.detectionMechanism)}`,
    '',
    '### 4. Fallback UX',
    `Slow Path: ${v(d.slowPath)}`,
    `Failure Path: ${v(d.failurePath)}`,
    `Low-Confidence Path: ${v(d.lowConfidencePath)}`,
    `Manual Override: ${d.manualOverrideEnabled ? v(d.manualOverride) || 'enabled' : 'not available'}`,
    '',
    '### 5. Training Data & Provenance',
    trainingData,
    '',
    '### 6. Cost Model',
    `Per-Call Cost: ${v(d.perCallCost)}`,
    `Expected Volume: ${v(d.expectedVolume)}`,
    `Monthly Cost at Launch: ${v(d.monthlyCost)}`,
    `Cost vs Value Analysis: ${v(d.costVsValue)}`,
    `Kill-Switch Criteria: ${v(d.killSwitch)}`,
    '',
    '### 7. Safety & Guardrails',
    `Blocked Behaviors: ${v(d.blockedBehaviors)}`,
    'Pre-Launch Reviewers:',
    reviewers,
    `Post-Launch Monitoring: ${v(d.postLaunchMonitoring)}`,
    `Abuse Handling: ${v(d.abuseHandling)}`,
    `Escalation Path & SLA: ${v(d.escalationPath)}`,
    '',
    '### 8. Rollout Plan',
    'Rollout Steps:',
    rolloutSteps,
    `Rollback Trigger: ${v(d.rollbackTrigger)}`,
    `Rollback Speed: ${v(d.rollbackSpeed)}`,
    `Rollback Decision-Maker: ${v(d.rollbackDecisionMaker)}`,
  ].join('\n')
}

// The eight AI sections and their per-section generation rules. Shared verbatim
// across modes; only the placement instruction differs per mode.
const AI_EIGHT_SECTIONS =
  "1. Model Selection Rationale — Why this model class, why this specific model, what alternatives were considered and rejected, what decision criteria were used. If alternatives_considered has fewer than 2 entries, generate a PLACEHOLDER prompting the PM to name at least 2 alternatives. If no decision criteria given, generate a PLACEHOLDER listing 3-5 common criteria.\n\n2. Eval Plan — Offline evaluation (test set, metrics, pass threshold) and online evaluation (behavioral signals, A/B test design). If pass_threshold lacks specific numbers, generate a PLACEHOLDER: 'A shippable threshold names specific numbers, not directional words.' If A/B plan is absent, generate PLACEHOLDER with the 5 inputs an A/B test needs.\n\n3. Hallucination & Failure Modes — Enumerate specific failure modes with expected rates and user impact. Must include at least 2. Include worst-case failure (the screenshot risk) and detection mechanism.\n\n4. Fallback UX — What happens when the model is slow, fails, or returns low-confidence results. Include manual override if applicable.\n\n5. Training Data & Provenance — Data sources, license/consent, PII handling, retention, deletion mechanism. If toggle says no additional data, write one line: 'No additional training data; uses foundation model only.'\n\n6. Cost Model — Per-call cost, expected volume, monthly projected cost, cost vs value analysis, kill-switch criteria. If kill-switch criteria is missing, generate PLACEHOLDER.\n\n7. Safety & Guardrails — Blocked behaviors, pre-launch reviewers, post-launch monitoring, abuse handling, escalation path with SLA.\n\n8. Rollout Plan — Shadow mode → percentage rollout → GA with specific gating metrics at each step. Include rollback trigger, speed, and decision-maker."

const AI_PLACEMENT: Record<Mode, string> = {
  'one-pager':
    "PLACEMENT (Mode A — 1-Pager): Combine all 8 into a single 'AI Considerations' section placed BEFORE the Top Risks section. Keep it concise — 1-2 sentences per sub-section.",
  full: "PLACEMENT (Mode B — Full PRD): Insert all 8 sections as full sections BETWEEN Acceptance Criteria and Success Metrics.",
  'pr-faq':
    "PLACEMENT (Mode C — PR/FAQ): Add an 'AI Considerations' subsection WITHIN the Execution FAQ that covers all 8 topics compactly.",
}

const AI_CONCISENESS =
  "CONCISENESS: Each AI section should be 3-7 bullet points or 2-5 sentences. Use PLACEHOLDER blocks (1-2 sentences max) where input is thin. Never fabricate model names, metrics, or thresholds not provided by the PM."

// Builds the mode-specific AI addendum appended to a mode's system prompt when
// the AI Feature toggle is on.
export function aiFeatureAddendum(mode: Mode): string {
  return [
    'The PM has toggled AI Feature mode. After the regular sections but BEFORE the Self-Review Checklist, generate these 8 additional sections using the AI feature inputs provided:',
    '',
    AI_EIGHT_SECTIONS,
    '',
    AI_PLACEMENT[mode],
    '',
    AI_CONCISENESS,
  ].join('\n')
}

export const PRD_SYSTEM_PROMPT =
  "You are a senior product manager helping a colleague turn structured product context into a full PRD. Write in a clear, direct PM voice — specific where the input is specific, calibrated where the input is vague. Where input is vague or missing, write a PLACEHOLDER block (e.g., 'PLACEHOLDER: success metrics — likely candidates include X, Y, Z; PM to confirm'). Never invent dependencies or constraints not in the input. Output the PRD in clean Markdown with these sections in order: Change History, Background, Problem Statement, Target Personas, Customer Quote, Alignment to Strategy, Assumptions, Proposed Solution, Scope, Non-Goals, User Flows (only if provided), Acceptance Criteria, Success Metrics, Risks, Dependencies, Open Questions. You MUST include every section listed above, even if the input is sparse — use PLACEHOLDER blocks for sections with thin input. The final section MUST always be the Self-Review Checklist. Never stop generating before the Self-Review Checklist is complete. End with a Self-Review Checklist that lists: sections where input was rich (Confidence), sections with PLACEHOLDERs (Needs Follow-up), likely reviewer questions, and recommended next actions. CONCISENESS RULES:\n- Total PRD length should be 1,500-3,500 words for a Full PRD. Never exceed 4,000 words.\n- Each section should be 2-5 sentences of prose or 3-7 bullet points. Not both.\n- PLACEHOLDER blocks are 1-2 sentences max: state what's missing and suggest 2-3 candidates. Do not expand PLACEHOLDERs into multi-paragraph explorations.\n- Do not add sub-sections, behavioral patterns, demographic details, or strategic questions that the PM did not provide. If input is thin, write a short PLACEHOLDER and move on.\n- When input is rich and specific, use the PM's language directly. Do not paraphrase into longer versions.\n- The Self-Review Checklist at the end should be bullet points only, not prose."
