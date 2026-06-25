import {
  type FieldSpec,
  type RequiredOverrides,
  specsComplete,
  specsMissing,
} from './required-overrides'

export type Mode = 'one-pager' | 'full' | 'pr-faq'

export type ModeMeta = {
  id: Mode
  label: string
  subtitle: string
  // Tailwind classes keyed off the per-mode accent tokens in globals.css.
  accentBorder: string
  accentBg: string
  accentText: string
  accentDot: string
}

export const MODES: ModeMeta[] = [
  {
    id: 'one-pager',
    label: '1-Pager',
    subtitle: 'Quick exploration, fits on one page',
    accentBorder: 'border-mode-one-pager',
    accentBg: 'bg-mode-one-pager/10',
    accentText: 'text-mode-one-pager',
    accentDot: 'bg-mode-one-pager',
  },
  {
    id: 'full',
    label: 'Full PRD',
    subtitle: 'Implementation-ready spec',
    accentBorder: 'border-mode-full',
    accentBg: 'bg-mode-full/10',
    accentText: 'text-mode-full',
    accentDot: 'bg-mode-full',
  },
  {
    id: 'pr-faq',
    label: 'PR/FAQ',
    subtitle: 'Amazon Working Backwards format',
    accentBorder: 'border-mode-pr-faq',
    accentBg: 'bg-mode-pr-faq/10',
    accentText: 'text-mode-pr-faq',
    accentDot: 'bg-mode-pr-faq',
  },
]

const filled = (v: string) => v.trim().length > 0

// ---------------------------------------------------------------------------
// Mode A — 1-Pager
// ---------------------------------------------------------------------------

export type OnePagerData = {
  targetCustomer: string
  problemStatement: string
  whyNow: string
  solutionSketch: string
  successMetrics: string
  topRisks: string
  openQuestions: string
}

export const initialOnePager: OnePagerData = {
  targetCustomer: '',
  problemStatement: '',
  whyNow: '',
  solutionSketch: '',
  successMetrics: '',
  topRisks: '',
  openQuestions: '',
}

export type OnePagerSection = 'problem' | 'solution' | 'risks'

// Customizable field specs grouped by the 1-Pager's three on-screen sections.
export const ONE_PAGER_FIELD_SPECS: Record<
  OnePagerSection,
  FieldSpec<OnePagerData>[]
> = {
  problem: [
    { key: 'targetCustomer', label: 'Target Customer', defaultRequired: true, isFilled: (d) => filled(d.targetCustomer) },
    { key: 'problemStatement', label: 'Problem Statement', defaultRequired: true, isFilled: (d) => filled(d.problemStatement) },
    { key: 'whyNow', label: 'Why Now', defaultRequired: true, isFilled: (d) => filled(d.whyNow) },
  ],
  solution: [
    { key: 'solutionSketch', label: 'Solution Sketch', defaultRequired: true, isFilled: (d) => filled(d.solutionSketch) },
    { key: 'successMetrics', label: 'Success Metrics', defaultRequired: true, isFilled: (d) => filled(d.successMetrics) },
  ],
  risks: [
    { key: 'topRisks', label: 'Top Risks', defaultRequired: true, isFilled: (d) => filled(d.topRisks) },
    { key: 'openQuestions', label: 'Open Questions', defaultRequired: true, isFilled: (d) => filled(d.openQuestions) },
  ],
}

const ALL_ONE_PAGER_SPECS = [
  ...ONE_PAGER_FIELD_SPECS.problem,
  ...ONE_PAGER_FIELD_SPECS.solution,
  ...ONE_PAGER_FIELD_SPECS.risks,
]

export function isOnePagerComplete(
  d: OnePagerData,
  overrides: RequiredOverrides = {},
): boolean {
  return specsComplete(ALL_ONE_PAGER_SPECS, d, overrides)
}

// ---------------------------------------------------------------------------
// Mode C — PR/FAQ (Amazon Working Backwards)
// ---------------------------------------------------------------------------

export type PrFaqPhase = 'customer' | 'vision' | 'strategic'

export type PrFaqData = {
  // Phase 1 — Customer & Problem
  targetCustomer: string
  currentPain: string
  whyExistingFail: string
  // Phase 2 — Product Vision
  productName: string
  launchDate: string
  keyBenefit: string
  customerQuote: string
  executiveQuote: string
  // Phase 3 — Strategic & Execution
  whyNow: string
  whatMustBeTrue: string
  hardestPart: string
  worstCase: string
  successMetrics: string
}

export const initialPrFaq: PrFaqData = {
  targetCustomer: '',
  currentPain: '',
  whyExistingFail: '',
  productName: '',
  launchDate: '',
  keyBenefit: '',
  customerQuote: '',
  executiveQuote: '',
  whyNow: '',
  whatMustBeTrue: '',
  hardestPart: '',
  worstCase: '',
  successMetrics: '',
}

// Customizable field specs grouped by PR/FAQ phase.
export const PR_FAQ_FIELD_SPECS: Record<PrFaqPhase, FieldSpec<PrFaqData>[]> = {
  customer: [
    { key: 'targetCustomer', label: 'Target Customer', defaultRequired: true, isFilled: (d) => filled(d.targetCustomer) },
    { key: 'currentPain', label: "Customer's Current Pain", defaultRequired: true, isFilled: (d) => filled(d.currentPain) },
    { key: 'whyExistingFail', label: 'Why Existing Solutions Fail', defaultRequired: true, isFilled: (d) => filled(d.whyExistingFail) },
  ],
  vision: [
    { key: 'productName', label: 'Product Name', defaultRequired: true, isFilled: (d) => filled(d.productName) },
    { key: 'launchDate', label: 'Launch Date', defaultRequired: true, isFilled: (d) => filled(d.launchDate) },
    { key: 'keyBenefit', label: 'Key Customer Benefit', defaultRequired: true, isFilled: (d) => filled(d.keyBenefit) },
    { key: 'customerQuote', label: 'Customer Quote', defaultRequired: true, isFilled: (d) => filled(d.customerQuote) },
    { key: 'executiveQuote', label: 'Executive Quote', defaultRequired: true, isFilled: (d) => filled(d.executiveQuote) },
  ],
  strategic: [
    { key: 'whyNow', label: 'Why Now?', defaultRequired: true, isFilled: (d) => filled(d.whyNow) },
    { key: 'whatMustBeTrue', label: 'What Needs to Be True', defaultRequired: true, isFilled: (d) => filled(d.whatMustBeTrue) },
    { key: 'hardestPart', label: 'Hardest Part to Build', defaultRequired: true, isFilled: (d) => filled(d.hardestPart) },
    { key: 'worstCase', label: 'Worst-Case Failure', defaultRequired: true, isFilled: (d) => filled(d.worstCase) },
    { key: 'successMetrics', label: 'Success Metrics', defaultRequired: true, isFilled: (d) => filled(d.successMetrics) },
  ],
}

export function isPrFaqPhaseComplete(
  phase: PrFaqPhase,
  d: PrFaqData,
  overrides: RequiredOverrides = {},
): boolean {
  return specsComplete(PR_FAQ_FIELD_SPECS[phase], d, overrides)
}

export function getPrFaqMissingFields(
  phase: PrFaqPhase,
  d: PrFaqData,
  overrides: RequiredOverrides = {},
): string[] {
  return specsMissing(PR_FAQ_FIELD_SPECS[phase], d, overrides)
}
