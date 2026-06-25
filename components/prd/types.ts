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

// Returns true when every required field for the given phase is filled.
export function isPhaseComplete(phase: Phase, data: PrdData): boolean {
  const filled = (v: string) => v.trim().length > 0
  if (phase === 'problem') {
    return (
      filled(data.productName) &&
      filled(data.background) &&
      filled(data.problemStatement) &&
      data.personas.length >= 1 &&
      data.personas.every(
        (p) =>
          filled(p.name) &&
          filled(p.role) &&
          filled(p.goals) &&
          filled(p.painPoints),
      ) &&
      filled(data.customerQuote) &&
      filled(data.alignment) &&
      filled(data.assumptions)
    )
  }
  if (phase === 'solution') {
    const completeCriteria = data.criteria.filter(
      (c) => c.persona.trim() && c.action.trim() && c.outcome.trim(),
    )
    return (
      filled(data.proposedSolution) &&
      filled(data.scope) &&
      filled(data.nonGoals) &&
      completeCriteria.length >= 1 &&
      filled(data.successMetrics)
    )
  }
  return (
    filled(data.risks) && filled(data.dependencies) && filled(data.openQuestions)
  )
}

// Returns a list of human-readable required fields that are still blocking the
// given phase from being considered complete. User Flows is intentionally NOT
// required, so it never appears here.
export function getMissingFields(phase: Phase, data: PrdData): string[] {
  const filled = (v: string) => v.trim().length > 0
  const missing: string[] = []

  if (phase === 'problem') {
    if (!filled(data.productName)) missing.push('Product / Feature Name')
    if (!filled(data.background)) missing.push('Background')
    if (!filled(data.problemStatement)) missing.push('Problem Statement')
    const incompletePersona = data.personas.some(
      (p) =>
        !filled(p.name) ||
        !filled(p.role) ||
        !filled(p.goals) ||
        !filled(p.painPoints),
    )
    if (data.personas.length < 1 || incompletePersona)
      missing.push('Target Personas (all fields)')
    if (!filled(data.customerQuote)) missing.push('Customer Quote')
    if (!filled(data.alignment)) missing.push('Strategic Alignment')
    if (!filled(data.assumptions)) missing.push('Assumptions')
    return missing
  }

  if (phase === 'solution') {
    if (!filled(data.proposedSolution)) missing.push('Proposed Solution')
    if (!filled(data.scope)) missing.push('Scope')
    if (!filled(data.nonGoals)) missing.push('Non-Goals')
    const completeCriteria = data.criteria.filter(
      (c) => c.persona.trim() && c.action.trim() && c.outcome.trim(),
    )
    if (completeCriteria.length < 1)
      missing.push('Acceptance Criteria (at least 1 complete entry)')
    if (!filled(data.successMetrics)) missing.push('Success Metrics')
    return missing
  }

  if (!filled(data.risks)) missing.push('Risks')
  if (!filled(data.dependencies)) missing.push('Dependencies')
  if (!filled(data.openQuestions)) missing.push('Open Questions')
  return missing
}
