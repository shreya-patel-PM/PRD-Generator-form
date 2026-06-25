'use client'

import { useState } from 'react'
import { Field, TextInput } from './fields'
import { ModeSelector } from './mode-selector'
import { OnePagerForm } from './one-pager-form'
import { FullPrdForm } from './full-prd-form'
import { PrFaqForm } from './pr-faq-form'
import { PrdOutput } from './prd-output'
import { usePrdGeneration } from './use-prd-generation'
import type { Mode } from './modes'

export function PrdForm() {
  const [mode, setMode] = useState<Mode>('full')
  const [productName, setProductName] = useState('')
  const [authorName, setAuthorName] = useState('')
  const gen = usePrdGeneration()

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
      <ModeSelector mode={mode} onChange={setMode} />

      {/* Active mode form */}
      {mode === 'one-pager' && (
        <OnePagerForm
          productName={productName}
          authorName={authorName}
          gen={gen}
        />
      )}
      {mode === 'full' && (
        <FullPrdForm
          productName={productName}
          authorName={authorName}
          gen={gen}
        />
      )}
      {mode === 'pr-faq' && (
        <PrFaqForm
          productName={productName}
          authorName={authorName}
          gen={gen}
        />
      )}
    </div>
  )
}
