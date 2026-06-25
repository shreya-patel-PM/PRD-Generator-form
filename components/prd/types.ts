import {
  type FieldSpec,
  type RequiredOverrides,
  specsComplete,
  specsMissing,
} from './required-overrides'

export type Persona = {
  id: string
  name: string
  role: string
  goals: string
  painPoints: string
}

export type Criterion = {
  id: string
  persona: string
  action: string
  outcome: string
}

export type PrdData = {
  // Header
  productName: string
  authorName: string
  // Phase 1 — Problem Space
  background: string
  problemStatement: string
  personas: Persona[]
  customerQuote: string
  alignment: string
  assumptions: string
  // Phase 2 — Solution Space
  proposedSolution: string
  scope: string
  nonGoals: string
  userFlows: string
  criteria: Criterion[]
  successMetrics: string
  // Phase 3 — Risks & Dependencies
  risks: string
  dependencies: string
  openQuestions: string
}

export const emptyPersona = (): Persona => ({
  id: crypto.randomUUID(),
  name: '',
  role: '',
  goals: '',
  painPoints: '',
})

export const emptyCriterion = (): Criterion => ({
  id: crypto.randomUUID(),
  persona: '',
  action: '',
  outcome: '',
})

export const initialData: PrdData = {
  productName: '',
  authorName: '',
  background: '',
  problemStatement: '',
  personas: [emptyPersona()],
  customerQuote: '',
  alignment: '',
  assumptions: '',
  proposedSolution: '',
  scope: '',
  nonGoals: '',
  userFlows: '',
  criteria: [emptyCriterion(), emptyCriterion(), emptyCriterion()],
  successMetrics: '',
  risks: '',
  dependencies: '',
  openQuestions: '',
}

export type Phase = 'problem' | 'solution' | 'risks'

const filled = (v: string) => v.trim().length > 0

const hasCompletePersona = (data: PrdData) =>
  data.personas.length >= 1 &&
  data.personas.some(
    (p) => filled(p.name) && filled(p.role) && filled(p.goals) && filled(p.painPoints),
  )

const hasCompleteCriterion = (data: PrdData) =>
  data.criteria.some(
    (c) => c.persona.trim() && c.action.trim() && c.outcome.trim(),
  )

// Per-phase customizable field specs. `defaultRequired` matches the rigidity
// each mode shipped with; PMs can flip these per field via the customize link.
export const FULL_FIELD_SPECS: Record<Phase, FieldSpec<PrdData>[]> = {
  problem: [
    { key: 'background', label: 'Background', defaultRequired: true, isFilled: (d) => filled(d.background) },
    { key: 'problemStatement', label: 'Problem Statement', defaultRequired: true, isFilled: (d) => filled(d.problemStatement) },
    { key: 'personas', label: 'Target Personas', defaultRequired: true, isFilled: hasCompletePersona },
    { key: 'customerQuote', label: 'Customer Quote', defaultRequired: true, isFilled: (d) => filled(d.customerQuote) },
    { key: 'alignment', label: 'Strategic Alignment', defaultRequired: true, isFilled: (d) => filled(d.alignment) },
    { key: 'assumptions', label: 'Assumptions', defaultRequired: true, isFilled: (d) => filled(d.assumptions) },
  ],
  solution: [
    { key: 'proposedSolution', label: 'Proposed Solution', defaultRequired: true, isFilled: (d) => filled(d.proposedSolution) },
    { key: 'scope', label: 'Scope', defaultRequired: true, isFilled: (d) => filled(d.scope) },
    { key: 'nonGoals', label: 'Non-Goals', defaultRequired: true, isFilled: (d) => filled(d.nonGoals) },
    { key: 'userFlows', label: 'User Flows', defaultRequired: false, isFilled: (d) => filled(d.userFlows) },
    { key: 'criteria', label: 'Acceptance Criteria', defaultRequired: true, isFilled: hasCompleteCriterion },
    { key: 'successMetrics', label: 'Success Metrics', defaultRequired: true, isFilled: (d) => filled(d.successMetrics) },
  ],
  risks: [
    { key: 'risks', label: 'Risks', defaultRequired: true, isFilled: (d) => filled(d.risks) },
    { key: 'dependencies', label: 'Dependencies', defaultRequired: true, isFilled: (d) => filled(d.dependencies) },
    { key: 'openQuestions', label: 'Open Questions', defaultRequired: true, isFilled: (d) => filled(d.openQuestions) },
  ],
}

// Returns true when every effectively-required field for the phase is filled.
// The document title (productName) is always required regardless of overrides.
export function isPhaseComplete(
  phase: Phase,
  data: PrdData,
  overrides: RequiredOverrides = {},
): boolean {
  const base = specsComplete(FULL_FIELD_SPECS[phase], data, overrides)
  if (phase === 'problem') return base && filled(data.productName)
  return base
}

// Returns the labels of effectively-required fields still blocking the phase.
export function getMissingFields(
  phase: Phase,
  data: PrdData,
  overrides: RequiredOverrides = {},
): string[] {
  const missing = specsMissing(FULL_FIELD_SPECS[phase], data, overrides)
  if (phase === 'problem' && !filled(data.productName))
    missing.unshift('Product / Feature Name')
  return missing
}
