'use client'

import { useCallback, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Field, TextInput, Toggle } from './fields'
import { ModeSelector } from './mode-selector'
import { ModeSwitchDialog } from './mode-switch-dialog'
import { OnePagerForm } from './one-pager-form'
import { FullPrdForm } from './full-prd-form'
import { PrFaqForm } from './pr-faq-form'
import { PrdOutput } from './prd-output'
import { AiFeatureSection } from './ai-feature-section'
import { usePrdGeneration } from './use-prd-generation'
import {
  getAiMissingFields,
  initialAiFeature,
  type AiFeatureControls,
  type AiFeatureData,
} from './ai-feature'
import type { Mode } from './modes'

export function PrdForm() {
  const [mode, setMode] = useState<Mode>('full')
  const [productName, setProductName] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiData, setAiData] = useState<AiFeatureData>(initialAiFeature)
  // Whether the active mode form has unsaved mode-specific content, and the
  // mode the PM is trying to switch to (drives the confirmation dialog).
  const [dirty, setDirty] = useState(false)
  const [pendingMode, setPendingMode] = useState<Mode | null>(null)
  const gen = usePrdGeneration()

  const setAi = useCallback(
    <K extends keyof AiFeatureData>(key: K, value: AiFeatureData[K]) =>
      setAiData((prev) => ({ ...prev, [key]: value })),
    [],
  )

  // Stable callback the active mode form uses to report its dirty state up.
  const handleDirtyChange = useCallback((isDirty: boolean) => {
    setDirty(isDirty)
  }, [])

  // Gate the mode switch: confirm first if there is mode-specific content that
  // would be cleared, otherwise switch immediately.
  const requestModeChange = useCallback(
    (next: Mode) => {
      setMode((current) => {
        if (next === current) return current
        if (dirty) {
          setPendingMode(next)
          return current
        }
        return next
      })
    },
    [dirty],
  )

  const confirmModeSwitch = useCallback(() => {
    setPendingMode((next) => {
      if (next) setMode(next)
      return null
    })
  }, [])

  if (gen.markdown !== null) {
    return (
      <PrdOutput
        markdown={gen.markdown}
        productName={productName}
        streaming={gen.streaming}
        onBack={gen.reset}
      />
    )
  }

  // Build the AI controls handed to whichever mode form is active. When the
  // toggle is off, the section is hidden, generation is never gated by AI
  // fields, and no aiFeature object is added to the payload.
  const aiMissing = aiEnabled ? getAiMissingFields(aiData) : []
  const ai: AiFeatureControls = {
    enabled: aiEnabled,
    ready: !aiEnabled || aiMissing.length === 0,
    payload: aiEnabled ? { aiFeature: aiData } : {},
    section: aiEnabled ? (
      <AiFeatureSection data={aiData} set={setAi} missing={aiMissing} />
    ) : null,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Universal header fields */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product / Feature Name" htmlFor="productName" required>
            <TextInput
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Smart Inbox"
            />
          </Field>
          <Field label="Author Name" htmlFor="authorName" optional>
            <TextInput
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
            />
          </Field>
        </div>
      </div>

      {/* Mode selector */}
      <ModeSelector mode={mode} onChange={requestModeChange} />

      {/* AI Feature toggle */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <label htmlFor="aiFeatureToggle" className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-foreground">
            AI Feature?
          </span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            Adds AI-specific sections most PMs miss: model selection, eval
            plans, failure modes, rollout strategy.
          </span>
        </label>
        <Toggle
          id="aiFeatureToggle"
          label="Enable AI feature sections"
          checked={aiEnabled}
          onChange={setAiEnabled}
        />
      </div>

      {/* AI mode banner */}
      {aiEnabled && (
        <div className="flex items-center gap-2 rounded-xl border border-mode-full/30 bg-mode-full/10 px-4 py-3 text-sm font-medium text-mode-full">
          <Sparkles className="size-4 shrink-0" />
          <span>AI Mode enabled — 8 additional sections will be generated.</span>
        </div>
      )}

      {/* Active mode form */}
      {mode === 'one-pager' && (
        <OnePagerForm
          productName={productName}
          authorName={authorName}
          gen={gen}
          ai={ai}
          onDirtyChange={handleDirtyChange}
        />
      )}
      {mode === 'full' && (
        <FullPrdForm
          productName={productName}
          authorName={authorName}
          gen={gen}
          ai={ai}
          onDirtyChange={handleDirtyChange}
        />
      )}
      {mode === 'pr-faq' && (
        <PrFaqForm
          productName={productName}
          authorName={authorName}
          gen={gen}
          ai={ai}
          onDirtyChange={handleDirtyChange}
        />
      )}

      <ModeSwitchDialog
        open={pendingMode !== null}
        onConfirm={confirmModeSwitch}
        onCancel={() => setPendingMode(null)}
      />
    </div>
  )
}
