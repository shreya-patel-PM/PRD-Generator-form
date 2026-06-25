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

export function isOnePagerComplete(d: OnePagerData): boolean {
  return (
    filled(d.targetCustomer) &&
    filled(d.problemStatement) &&
    filled(d.whyNow) &&
    filled(d.solutionSketch) &&
    filled(d.successMetrics) &&
    filled(d.topRisks) &&
    filled(d.openQuestions)
  )
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

export function isPrFaqPhaseComplete(
  phase: PrFaqPhase,
  d: PrFaqData,
): boolean {
  if (phase === 'customer') {
    return (
      filled(d.targetCustomer) &&
      filled(d.currentPain) &&
      filled(d.whyExistingFail)
    )
  }
  if (phase === 'vision') {
    return (
      filled(d.productName) &&
      filled(d.launchDate) &&
      filled(d.keyBenefit) &&
      filled(d.customerQuote) &&
      filled(d.executiveQuote)
    )
  }
  return (
    filled(d.whyNow) &&
    filled(d.whatMustBeTrue) &&
    filled(d.hardestPart) &&
    filled(d.worstCase) &&
    filled(d.successMetrics)
  )
}

export function getPrFaqMissingFields(
  phase: PrFaqPhase,
  d: PrFaqData,
): string[] {
  const missing: string[] = []
  if (phase === 'customer') {
    if (!filled(d.targetCustomer)) missing.push('Target Customer')
    if (!filled(d.currentPain)) missing.push("Customer's Current Pain")
    if (!filled(d.whyExistingFail)) missing.push('Why Existing Solutions Fail')
    return missing
  }
  if (phase === 'vision') {
    if (!filled(d.productName)) missing.push('Product Name')
    if (!filled(d.launchDate)) missing.push('Launch Date')
    if (!filled(d.keyBenefit)) missing.push('Key Customer Benefit')
    if (!filled(d.customerQuote)) missing.push('Customer Quote')
    if (!filled(d.executiveQuote)) missing.push('Executive Quote')
    return missing
  }
  if (!filled(d.whyNow)) missing.push('Why Now?')
  if (!filled(d.whatMustBeTrue)) missing.push('What Needs to Be True')
  if (!filled(d.hardestPart)) missing.push('Hardest Part to Build')
  if (!filled(d.worstCase)) missing.push('Worst-Case Failure')
  if (!filled(d.successMetrics)) missing.push('Success Metrics')
  return missing
}
