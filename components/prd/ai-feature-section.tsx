'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Sparkles, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, Select, TextArea, TextInput, Toggle } from './fields'
import { BlockingFields } from './form-shared'
import {
  emptyAlternative,
  emptyFailureMode,
  emptyReviewer,
  emptyRolloutStep,
  MODEL_CLASSES,
  type AiFeatureData,
  type Alternative,
  type FailureMode,
  type Reviewer,
  type RolloutStep,
} from './ai-feature'

type SetAi = <K extends keyof AiFeatureData>(
  key: K,
  value: AiFeatureData[K],
) => void

function SubSection({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-border/70 pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-mode-full text-xs font-semibold text-card">
          {n}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function RepeatRow({
  index,
  label,
  onRemove,
  canRemove,
  children,
}: {
  index: number
  label: string
  onRemove: () => void
  canRemove: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label} {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
          onClick={onRemove}
          disabled={!canRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>
      {children}
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div>
      <Button type="button" variant="outline" size="sm" onClick={onClick}>
        <Plus />
        {label}
      </Button>
    </div>
  )
}

function AlternativesBlock({
  items,
  onChange,
}: {
  items: Alternative[]
  onChange: (next: Alternative[]) => void
}) {
  const update = (id: string, patch: Partial<Alternative>) =>
    onChange(items.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <FieldLabel required>Alternatives Considered</FieldLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          List at least two models you evaluated and rejected.
        </p>
      </div>
      {items.map((a, i) => (
        <RepeatRow
          key={a.id}
          index={i}
          label="Alternative"
          canRemove={items.length > 2}
          onRemove={() => onChange(items.filter((x) => x.id !== a.id))}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Model Name" required>
              <TextInput
                value={a.modelName}
                onChange={(e) => update(a.id, { modelName: e.target.value })}
                placeholder="e.g. GPT-4o-mini"
              />
            </Field>
            <Field label="Why Rejected" required>
              <TextInput
                value={a.whyRejected}
                onChange={(e) => update(a.id, { whyRejected: e.target.value })}
                placeholder="e.g. Too slow at p95"
              />
            </Field>
          </div>
        </RepeatRow>
      ))}
      <AddButton
        label="Add alternative"
        onClick={() => onChange([...items, emptyAlternative()])}
      />
    </div>
  )
}

function FailureModesBlock({
  items,
  onChange,
}: {
  items: FailureMode[]
  onChange: (next: FailureMode[]) => void
}) {
  const update = (id: string, patch: Partial<FailureMode>) =>
    onChange(items.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <FieldLabel required>Failure Modes</FieldLabel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Document at least two ways the model can fail.
        </p>
      </div>
      {items.map((f, i) => (
        <RepeatRow
          key={f.id}
          index={i}
          label="Failure mode"
          canRemove={items.length > 2}
          onRemove={() => onChange(items.filter((x) => x.id !== f.id))}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name" required>
              <TextInput
                value={f.name}
                onChange={(e) => update(f.id, { name: e.target.value })}
                placeholder="e.g. Hallucinated citation"
              />
            </Field>
            <Field label="Expected Rate" required>
              <TextInput
                value={f.expectedRate}
                onChange={(e) => update(f.id, { expectedRate: e.target.value })}
                placeholder="e.g. ~2% of calls"
              />
            </Field>
            <Field label="User Impact" required>
              <TextInput
                value={f.userImpact}
                onChange={(e) => update(f.id, { userImpact: e.target.value })}
                placeholder="e.g. Misleading answer"
              />
            </Field>
          </div>
        </RepeatRow>
      ))}
      <AddButton
        label="Add failure mode"
        onClick={() => onChange([...items, emptyFailureMode()])}
      />
    </div>
  )
}

function ReviewersBlock({
  items,
  onChange,
}: {
  items: Reviewer[]
  onChange: (next: Reviewer[]) => void
}) {
  const update = (id: string, patch: Partial<Reviewer>) =>
    onChange(items.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  return (
    <div className="flex flex-col gap-3">
      <FieldLabel>Pre-Launch Reviewers</FieldLabel>
      {items.map((r, i) => (
        <RepeatRow
          key={r.id}
          index={i}
          label="Reviewer"
          canRemove={items.length > 1}
          onRemove={() => onChange(items.filter((x) => x.id !== r.id))}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Team">
              <TextInput
                value={r.team}
                onChange={(e) => update(r.id, { team: e.target.value })}
                placeholder="e.g. Legal"
              />
            </Field>
            <Field label="Date">
              <TextInput
                type="date"
                value={r.date}
                onChange={(e) => update(r.id, { date: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <TextInput
                value={r.status}
                onChange={(e) => update(r.id, { status: e.target.value })}
                placeholder="e.g. Pending"
              />
            </Field>
          </div>
        </RepeatRow>
      ))}
      <AddButton
        label="Add reviewer"
        onClick={() => onChange([...items, emptyReviewer()])}
      />
    </div>
  )
}

function RolloutStepsBlock({
  items,
  onChange,
}: {
  items: RolloutStep[]
  onChange: (next: RolloutStep[]) => void
}) {
  const update = (id: string, patch: Partial<RolloutStep>) =>
    onChange(items.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  return (
    <div className="flex flex-col gap-3">
      <FieldLabel>Rollout Steps</FieldLabel>
      {items.map((s, i) => (
        <RepeatRow
          key={s.id}
          index={i}
          label="Step"
          canRemove={items.length > 1}
          onRemove={() => onChange(items.filter((x) => x.id !== s.id))}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Step Name">
              <TextInput
                value={s.name}
                onChange={(e) => update(s.id, { name: e.target.value })}
                placeholder="e.g. Internal dogfood"
              />
            </Field>
            <Field label="Duration">
              <TextInput
                value={s.duration}
                onChange={(e) => update(s.id, { duration: e.target.value })}
                placeholder="e.g. 2 weeks"
              />
            </Field>
            <Field label="Gate Metric">
              <TextInput
                value={s.gateMetric}
                onChange={(e) => update(s.id, { gateMetric: e.target.value })}
                placeholder="e.g. <1% error rate"
              />
            </Field>
            <Field label="Escalation Criteria">
              <TextInput
                value={s.escalation}
                onChange={(e) => update(s.id, { escalation: e.target.value })}
                placeholder="e.g. Pause if >5% errors"
              />
            </Field>
          </div>
        </RepeatRow>
      ))}
      <AddButton
        label="Add step"
        onClick={() => onChange([...items, emptyRolloutStep()])}
      />
    </div>
  )
}

export function AiFeatureSection({
  data,
  set,
  missing,
}: {
  data: AiFeatureData
  set: SetAi
  missing: string[]
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="overflow-hidden rounded-2xl border border-border border-l-4 border-l-mode-full bg-card/50 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left sm:px-7"
      >
        <Sparkles className="size-5 shrink-0 text-mode-full" />
        <span className="flex flex-1 flex-col">
          <span className="text-base font-semibold text-foreground">
            AI Feature Details
          </span>
          <span className="text-xs text-muted-foreground">
            Eight AI-specific sections appended to your document
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-7 px-5 pb-6 sm:px-7">
          <BlockingFields missing={missing} nextLabel={null} />

          <SubSection n={1} title="Model Selection Rationale">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Model Class" htmlFor="ai-modelClass">
                <Select
                  id="ai-modelClass"
                  value={data.modelClass}
                  onChange={(e) => set('modelClass', e.target.value)}
                >
                  {MODEL_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Specific Model"
                htmlFor="ai-specificModel"
                hint="e.g., Claude Sonnet 4.5, XGBoost, BERT-base"
              >
                <TextInput
                  id="ai-specificModel"
                  value={data.specificModel}
                  onChange={(e) => set('specificModel', e.target.value)}
                  placeholder="e.g. Claude Sonnet 4.5"
                />
              </Field>
            </div>
            <AlternativesBlock
              items={data.alternatives}
              onChange={(next) => set('alternatives', next)}
            />
            <Field
              label="Decision Criteria"
              htmlFor="ai-decisionCriteria"
              hint="What criteria drove the choice? e.g., latency, cost, quality on a specific test set"
            >
              <TextArea
                id="ai-decisionCriteria"
                value={data.decisionCriteria}
                onChange={(e) => set('decisionCriteria', e.target.value)}
                placeholder="The criteria that drove the decision..."
              />
            </Field>
          </SubSection>

          <SubSection n={2} title="Eval Plan">
            <Field
              label="Test Set Description"
              htmlFor="ai-testSet"
              hint="Size, source, how it was built, label provenance"
            >
              <TextArea
                id="ai-testSet"
                value={data.testSet}
                onChange={(e) => set('testSet', e.target.value)}
                placeholder="Describe the evaluation set..."
              />
            </Field>
            <Field
              label="Offline Metrics & Targets"
              htmlFor="ai-offlineMetrics"
              hint="e.g., F1 ≥ 0.85, BLEU ≥ 35, accuracy at top-K"
            >
              <TextArea
                id="ai-offlineMetrics"
                value={data.offlineMetrics}
                onChange={(e) => set('offlineMetrics', e.target.value)}
                placeholder="Metrics and target values..."
              />
            </Field>
            <Field
              label="Pass Threshold"
              htmlFor="ai-passThreshold"
              required
              hint="The specific number that lets this feature ship"
            >
              <TextArea
                id="ai-passThreshold"
                value={data.passThreshold}
                onChange={(e) => set('passThreshold', e.target.value)}
                placeholder="e.g. F1 ≥ 0.85 on the golden set"
              />
            </Field>
            <Field
              label="Online Signals & A/B Plan"
              htmlFor="ai-onlineSignals"
              hint="Behavioral signals, A/B test design, success metric. Type TBD if not yet defined."
            >
              <TextArea
                id="ai-onlineSignals"
                value={data.onlineSignals}
                onChange={(e) => set('onlineSignals', e.target.value)}
                placeholder="Online validation plan, or TBD"
              />
            </Field>
          </SubSection>

          <SubSection n={3} title="Hallucination & Failure Modes">
            <FailureModesBlock
              items={data.failureModes}
              onChange={(next) => set('failureModes', next)}
            />
            <Field
              label="Worst-Case Failure"
              htmlFor="ai-worstCaseFailure"
              required
              hint="The screenshot risk — the single failure that would make this feature regrettable if it leaked"
            >
              <TextArea
                id="ai-worstCaseFailure"
                value={data.worstCaseFailure}
                onChange={(e) => set('worstCaseFailure', e.target.value)}
                placeholder="The failure you'd never want to see on social media..."
              />
            </Field>
            <Field
              label="Detection Mechanism"
              htmlFor="ai-detectionMechanism"
              hint="How do we know it's happening in production?"
            >
              <TextArea
                id="ai-detectionMechanism"
                value={data.detectionMechanism}
                onChange={(e) => set('detectionMechanism', e.target.value)}
                placeholder="Monitoring, alerts, sampling..."
              />
            </Field>
          </SubSection>

          <SubSection n={4} title="Fallback UX">
            <Field
              label="Slow Path"
              htmlFor="ai-slowPath"
              hint="What does the user see when the model is slow?"
            >
              <TextArea
                id="ai-slowPath"
                value={data.slowPath}
                onChange={(e) => set('slowPath', e.target.value)}
                placeholder="Loading state, timeout behavior..."
              />
            </Field>
            <Field
              label="Failure Path"
              htmlFor="ai-failurePath"
              hint="What happens when the model errors or returns empty?"
            >
              <TextArea
                id="ai-failurePath"
                value={data.failurePath}
                onChange={(e) => set('failurePath', e.target.value)}
                placeholder="Error handling, graceful degradation..."
              />
            </Field>
            <Field
              label="Low-Confidence Path"
              htmlFor="ai-lowConfidencePath"
              hint="Is the result shown, hidden, or annotated when confidence is low?"
            >
              <TextArea
                id="ai-lowConfidencePath"
                value={data.lowConfidencePath}
                onChange={(e) => set('lowConfidencePath', e.target.value)}
                placeholder="How low-confidence output is handled..."
              />
            </Field>
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor="ai-manualOverrideEnabled">
                  Manual Override
                </FieldLabel>
                <Toggle
                  id="ai-manualOverrideEnabled"
                  label="Manual override available"
                  checked={data.manualOverrideEnabled}
                  onChange={(v) => set('manualOverrideEnabled', v)}
                />
              </div>
              {data.manualOverrideEnabled && (
                <Field label="How can the user bypass the model?">
                  <TextArea
                    value={data.manualOverride}
                    onChange={(e) => set('manualOverride', e.target.value)}
                    placeholder="Describe the manual override path..."
                  />
                </Field>
              )}
            </div>
          </SubSection>

          <SubSection n={5} title="Training Data & Provenance">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <FieldLabel htmlFor="ai-usesTrainingData">
                Uses additional training / RAG data?
              </FieldLabel>
              <Toggle
                id="ai-usesTrainingData"
                label="Uses additional training data"
                checked={data.usesTrainingData}
                onChange={(v) => set('usesTrainingData', v)}
              />
            </div>
            {data.usesTrainingData ? (
              <div className="flex flex-col gap-4">
                <Field label="Data Sources" htmlFor="ai-dataSources">
                  <TextArea
                    id="ai-dataSources"
                    value={data.dataSources}
                    onChange={(e) => set('dataSources', e.target.value)}
                    placeholder="Where does the data come from?"
                  />
                </Field>
                <Field label="License / Consent Basis" htmlFor="ai-licenseBasis">
                  <TextArea
                    id="ai-licenseBasis"
                    value={data.licenseBasis}
                    onChange={(e) => set('licenseBasis', e.target.value)}
                    placeholder="Legal basis for using this data..."
                  />
                </Field>
                <Field label="PII Handling" htmlFor="ai-piiHandling">
                  <TextArea
                    id="ai-piiHandling"
                    value={data.piiHandling}
                    onChange={(e) => set('piiHandling', e.target.value)}
                    placeholder="How is personal data handled?"
                  />
                </Field>
                <Field label="Retention Policy" htmlFor="ai-retentionPolicy">
                  <TextArea
                    id="ai-retentionPolicy"
                    value={data.retentionPolicy}
                    onChange={(e) => set('retentionPolicy', e.target.value)}
                    placeholder="How long is data retained?"
                  />
                </Field>
                <Field
                  label="Deletion Mechanism"
                  htmlFor="ai-deletionMechanism"
                >
                  <TextArea
                    id="ai-deletionMechanism"
                    value={data.deletionMechanism}
                    onChange={(e) => set('deletionMechanism', e.target.value)}
                    placeholder="How can data be deleted on request?"
                  />
                </Field>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No additional training data; uses foundation model only.
              </p>
            )}
          </SubSection>

          <SubSection n={6} title="Cost Model">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Per-Call Cost"
                htmlFor="ai-perCallCost"
                hint="e.g., $0.003 per call"
              >
                <TextInput
                  id="ai-perCallCost"
                  value={data.perCallCost}
                  onChange={(e) => set('perCallCost', e.target.value)}
                  placeholder="$0.003"
                />
              </Field>
              <Field
                label="Expected Volume"
                htmlFor="ai-expectedVolume"
                hint="Calls per day at launch"
              >
                <TextInput
                  id="ai-expectedVolume"
                  value={data.expectedVolume}
                  onChange={(e) => set('expectedVolume', e.target.value)}
                  placeholder="50,000 / day"
                />
              </Field>
              <Field label="Monthly Cost at Launch" htmlFor="ai-monthlyCost">
                <TextInput
                  id="ai-monthlyCost"
                  value={data.monthlyCost}
                  onChange={(e) => set('monthlyCost', e.target.value)}
                  placeholder="$4,500 / mo"
                />
              </Field>
            </div>
            <Field label="Cost vs Value Analysis" htmlFor="ai-costVsValue">
              <TextArea
                id="ai-costVsValue"
                value={data.costVsValue}
                onChange={(e) => set('costVsValue', e.target.value)}
                placeholder="Is the value worth the cost?"
              />
            </Field>
            <Field
              label="Kill-Switch Criteria"
              htmlFor="ai-killSwitch"
              hint="At what unit economics is this feature shut off?"
            >
              <TextArea
                id="ai-killSwitch"
                value={data.killSwitch}
                onChange={(e) => set('killSwitch', e.target.value)}
                placeholder="e.g. If cost-per-resolved-ticket exceeds $0.50"
              />
            </Field>
          </SubSection>

          <SubSection n={7} title="Safety & Guardrails">
            <Field
              label="Blocked Behaviors"
              htmlFor="ai-blockedBehaviors"
              hint="What the model must refuse or filter"
            >
              <TextArea
                id="ai-blockedBehaviors"
                value={data.blockedBehaviors}
                onChange={(e) => set('blockedBehaviors', e.target.value)}
                placeholder="Content and actions the model must never produce..."
              />
            </Field>
            <ReviewersBlock
              items={data.reviewers}
              onChange={(next) => set('reviewers', next)}
            />
            <Field
              label="Post-Launch Monitoring"
              htmlFor="ai-postLaunchMonitoring"
            >
              <TextArea
                id="ai-postLaunchMonitoring"
                value={data.postLaunchMonitoring}
                onChange={(e) => set('postLaunchMonitoring', e.target.value)}
                placeholder="What gets monitored after launch?"
              />
            </Field>
            <Field label="Abuse Handling" htmlFor="ai-abuseHandling">
              <TextArea
                id="ai-abuseHandling"
                value={data.abuseHandling}
                onChange={(e) => set('abuseHandling', e.target.value)}
                placeholder="How is misuse detected and handled?"
              />
            </Field>
            <Field label="Escalation Path & SLA" htmlFor="ai-escalationPath">
              <TextArea
                id="ai-escalationPath"
                value={data.escalationPath}
                onChange={(e) => set('escalationPath', e.target.value)}
                placeholder="Who is paged, and how fast must they respond?"
              />
            </Field>
          </SubSection>

          <SubSection n={8} title="Rollout Plan">
            <RolloutStepsBlock
              items={data.rolloutSteps}
              onChange={(next) => set('rolloutSteps', next)}
            />
            <Field
              label="Rollback Trigger"
              htmlFor="ai-rollbackTrigger"
              hint="Specific numbers that trigger reverting"
            >
              <TextArea
                id="ai-rollbackTrigger"
                value={data.rollbackTrigger}
                onChange={(e) => set('rollbackTrigger', e.target.value)}
                placeholder="e.g. Error rate >3% for 15 minutes"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Rollback Speed"
                htmlFor="ai-rollbackSpeed"
                hint="Hours to revert"
              >
                <TextInput
                  id="ai-rollbackSpeed"
                  value={data.rollbackSpeed}
                  onChange={(e) => set('rollbackSpeed', e.target.value)}
                  placeholder="< 1 hour"
                />
              </Field>
              <Field
                label="Rollback Decision-Maker"
                htmlFor="ai-rollbackDecisionMaker"
                hint="Role or team that decides"
              >
                <TextInput
                  id="ai-rollbackDecisionMaker"
                  value={data.rollbackDecisionMaker}
                  onChange={(e) =>
                    set('rollbackDecisionMaker', e.target.value)
                  }
                  placeholder="e.g. On-call eng lead"
                />
              </Field>
            </div>
          </SubSection>
        </div>
      )}
    </div>
  )
}
