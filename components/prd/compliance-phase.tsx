'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Select, TextArea, TextInput, Toggle } from './fields'
import {
  emptySignoff,
  type ComplianceData,
  type Signoff,
  type SignoffStatus,
} from './compliance'

function ReviewToggle({
  title,
  hint,
  enabled,
  notes,
  onToggle,
  onNotes,
  notesPlaceholder,
}: {
  title: string
  hint: string
  enabled: boolean
  notes: string
  onToggle: (next: boolean) => void
  onNotes: (next: string) => void
  notesPlaceholder: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
        </div>
        <Toggle
          checked={enabled}
          onChange={onToggle}
          label={`${title} needed`}
        />
      </div>
      {enabled && (
        <div className="mt-3">
          <TextArea
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
            placeholder={notesPlaceholder}
            className="min-h-20"
            aria-label={`${title} notes`}
          />
        </div>
      )}
    </div>
  )
}

function SignoffsBlock({
  signoffs,
  onChange,
}: {
  signoffs: Signoff[]
  onChange: (signoffs: Signoff[]) => void
}) {
  const update = (id: string, patch: Partial<Signoff>) =>
    onChange(signoffs.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const remove = (id: string) => onChange(signoffs.filter((s) => s.id !== id))
  const add = () => onChange([...signoffs, emptySignoff()])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <FieldLabel optional>Stakeholder Sign-offs</FieldLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Track approvals from the stakeholders who need to review this PRD.
        </p>
      </div>

      {signoffs.length > 0 && (
        <div className="flex flex-col gap-3">
          {signoffs.map((s, index) => (
            <div
              key={s.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Sign-off {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove sign-off ${index + 1}`}
                  onClick={() => remove(s.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <TextInput
                  value={s.name}
                  onChange={(e) => update(s.id, { name: e.target.value })}
                  placeholder="Name"
                  aria-label="Stakeholder name"
                />
                <TextInput
                  value={s.role}
                  onChange={(e) => update(s.id, { role: e.target.value })}
                  placeholder="Role"
                  aria-label="Stakeholder role"
                />
                <Select
                  value={s.status}
                  onChange={(e) =>
                    update(s.id, { status: e.target.value as SignoffStatus })
                  }
                  aria-label="Sign-off status"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus />
          Add sign-off
        </Button>
      </div>
    </div>
  )
}

export function CompliancePhase({
  data,
  onChange,
}: {
  data: ComplianceData
  onChange: (patch: Partial<ComplianceData>) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Capture any reviews and approvals this work needs. Everything here is
        optional — enable only what applies, and it will be added to the
        generated document.
      </p>

      <ReviewToggle
        title="Legal Review Needed?"
        hint="Contracts, terms, regulatory or IP considerations."
        enabled={data.legalNeeded}
        notes={data.legalNotes}
        onToggle={(v) => onChange({ legalNeeded: v })}
        onNotes={(v) => onChange({ legalNotes: v })}
        notesPlaceholder="What does legal need to review, and any known concerns?"
      />

      <ReviewToggle
        title="Privacy Review Needed?"
        hint="Personal data collection, consent, retention, or deletion."
        enabled={data.privacyNeeded}
        notes={data.privacyNotes}
        onToggle={(v) => onChange({ privacyNeeded: v })}
        onNotes={(v) => onChange({ privacyNotes: v })}
        notesPlaceholder="What privacy questions need to be answered?"
      />

      <ReviewToggle
        title="Security / Data Review Needed?"
        hint="Threat model, data handling, access controls, or storage."
        enabled={data.securityNeeded}
        notes={data.securityNotes}
        onToggle={(v) => onChange({ securityNeeded: v })}
        onNotes={(v) => onChange({ securityNotes: v })}
        notesPlaceholder="What security or data-handling review is required?"
      />

      <SignoffsBlock
        signoffs={data.signoffs}
        onChange={(signoffs) => onChange({ signoffs })}
      />
    </div>
  )
}
