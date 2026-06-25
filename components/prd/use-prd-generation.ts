'use client'

import { useCallback, useState } from 'react'

// Shared streaming-generation logic used by all three PRD modes. Posts the
// payload (which includes `mode`) to /api/generate and reads the response
// progressively so the document renders in real time.
export function usePrdGeneration() {
  const [generating, setGenerating] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (payload: Record<string, unknown>) => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Generation failed.')
      }
      if (!res.body) throw new Error('No response stream received.')

      setMarkdown('')
      setStreaming(true)
      setGenerating(false)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMarkdown(acc)
      }
      acc += decoder.decode()
      setMarkdown(acc)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setMarkdown(null)
    } finally {
      setGenerating(false)
      setStreaming(false)
    }
  }, [])

  const reset = useCallback(() => {
    setMarkdown(null)
    setError(null)
  }, [])

  return { generating, streaming, markdown, error, generate, reset }
}

export type PrdGeneration = ReturnType<typeof usePrdGeneration>
