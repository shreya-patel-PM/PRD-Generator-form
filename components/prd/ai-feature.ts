import type { ReactNode } from 'react'

// Cross-cutting "AI Feature" details that can be attached to any of the three
// PRD modes. When enabled, these eight sections are appended to the generated
// document. Required-to-generate fields: Pass Threshold, Worst-Case Failure,
// at least 2 complete Alternatives, and at least 2 complete Failure Modes.

let counter = 0
const uid = () => `ai-${Date.now()}-${counter++}`

export type Alternative = { id: string; modelName: string; whyRejected: string }
export type FailureMode = {
  id: string
  name: string
  expectedRate: string
  userImpact: string
}
export type Reviewer = {
  id: string
  team: string
  date: string
  status: string
}
export type RolloutStep = {
  id: string
  name: string
  duration: string
  gateMetric: string
  escalation: string
}

export const emptyAlternative = (): Alternative => ({
  id: uid(),
  modelName: '',
  whyRejected: '',
})
export const emptyFailureMode = (): FailureMode => ({
  id: uid(),
  name: '',
  expectedRate: '',
  userImpact: '',
})
export const emptyReviewer = (): Reviewer => ({
  id: uid(),
  team: '',
  date: '',
  status: '',
})
export const emptyRolloutStep = (): RolloutStep => ({
  id: uid(),
  name: '',
  duration: '',
  gateMetric: '',
  escalation: '',
})

export const MODEL_CLASSES = [
  'LLM',
  'Classifier',
  'Embedding',
  'Recommender',
  'Multi-Modal',
  'Other',
] as const

export type AiFeatureData = {
  // 1 — Model Selection Rationale
  modelClass: string
  specificModel: string
  alternatives: Alternative[]
  decisionCriteria: string
  // 2 — Eval Plan
  testSet: string
  offlineMetrics: string
  passThreshold: string
  onlineSignals: string
  // 3 — Hallucination & Failure Modes
  failureModes: FailureMode[]
  worstCaseFailure: string
  detectionMechanism: string
  // 4 — Fallback UX
  slowPath: string
  failurePath: string
  lowConfidencePath: string
  manualOverrideEnabled: boolean
  manualOverride: string
  // 5 — Training Data & Provenance
  usesTrainingData: boolean
  dataSources: string
  licenseBasis: string
  piiHandling: string
  retentionPolicy: string
  deletionMechanism: string
  // 6 — Cost Model
  perCallCost: string
  expectedVolume: string
  monthlyCost: string
  costVsValue: string
  killSwitch: string
  // 7 — Safety & Guardrails
  blockedBehaviors: string
  reviewers: Reviewer[]
  postLaunchMonitoring: string
  abuseHandling: string
  escalationPath: string
  // 8 — Rollout Plan
  rolloutSteps: RolloutStep[]
  rollbackTrigger: string
  rollbackSpeed: string
  rollbackDecisionMaker: string
}

export const initialAiFeature: AiFeatureData = {
  modelClass: 'LLM',
  specificModel: '',
  alternatives: [emptyAlternative(), emptyAlternative()],
  decisionCriteria: '',
  testSet: '',
  offlineMetrics: '',
  passThreshold: '',
  onlineSignals: '',
  failureModes: [emptyFailureMode(), emptyFailureMode()],
  worstCaseFailure: '',
  detectionMechanism: '',
  slowPath: '',
  failurePath: '',
  lowConfidencePath: '',
  manualOverrideEnabled: false,
  manualOverride: '',
  usesTrainingData: false,
  dataSources: '',
  licenseBasis: '',
  piiHandling: '',
  retentionPolicy: '',
  deletionMechanism: '',
  perCallCost: '',
  expectedVolume: '',
  monthlyCost: '',
  costVsValue: '',
  killSwitch: '',
  blockedBehaviors: '',
  reviewers: [emptyReviewer()],
  postLaunchMonitoring: '',
  abuseHandling: '',
  escalationPath: '',
  rolloutSteps: [emptyRolloutStep()],
  rollbackTrigger: '',
  rollbackSpeed: '',
  rollbackDecisionMaker: '',
}

const filled = (v: string) => v.trim().length > 0

export function getAiMissingFields(d: AiFeatureData): string[] {
  const missing: string[] = []
  const completeAlts = d.alternatives.filter(
    (a) => filled(a.modelName) && filled(a.whyRejected),
  )
  const completeFms = d.failureModes.filter(
    (f) => filled(f.name) && filled(f.expectedRate) && filled(f.userImpact),
  )
  if (!filled(d.passThreshold)) missing.push('Pass Threshold')
  if (!filled(d.worstCaseFailure)) missing.push('Worst-Case Failure')
  if (completeAlts.length < 2)
    missing.push('Alternatives Considered (min 2 complete)')
  if (completeFms.length < 2)
    missing.push('Failure Modes (min 2 complete)')
  return missing
}

export function isAiFeatureComplete(d: AiFeatureData): boolean {
  return getAiMissingFields(d).length === 0
}

// Controls handed from the router down to each mode form so the AI Feature
// Details section renders before the Generate button and its data is merged
// into the generation payload.
export type AiFeatureControls = {
  enabled: boolean
  ready: boolean
  payload: Record<string, unknown>
  section: ReactNode
}
