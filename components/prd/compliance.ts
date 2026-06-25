export type SignoffStatus = 'Pending' | 'Approved' | 'Rejected'

export type Signoff = {
  id: string
  name: string
  role: string
  status: SignoffStatus
}

export type ComplianceData = {
  legalNeeded: boolean
  legalNotes: string
  privacyNeeded: boolean
  privacyNotes: string
  securityNeeded: boolean
  securityNotes: string
  signoffs: Signoff[]
}

export const emptySignoff = (): Signoff => ({
  id: crypto.randomUUID(),
  name: '',
  role: '',
  status: 'Pending',
})

export const initialCompliance: ComplianceData = {
  legalNeeded: false,
  legalNotes: '',
  privacyNeeded: false,
  privacyNotes: '',
  securityNeeded: false,
  securityNotes: '',
  signoffs: [],
}

// True when the PM has supplied any compliance content worth rendering.
export function hasComplianceContent(d: ComplianceData): boolean {
  return (
    d.legalNeeded ||
    d.privacyNeeded ||
    d.securityNeeded ||
    d.signoffs.some((s) => s.name.trim() || s.role.trim())
  )
}
