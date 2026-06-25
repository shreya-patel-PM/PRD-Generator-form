'use client'

import { useState } from 'react'
import { ArrowLeft, Check, Copy, Download, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'

function slugify(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return base || 'prd'
}

export function PrdOutput({
  markdown,
  productName,
  streaming = false,
  onBack,
}: {
  markdown: string
  productName: string
  streaming?: boolean
  onBack: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(productName)}-prd.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="self-start">
          <ArrowLeft />
          Back to editor
        </Button>
        <div className="flex items-center gap-2">
          {streaming && (
            <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Generating...
            </span>
          )}
          <Button variant="outline" size="sm" onClick={copy} disabled={streaming}>
            {copied ? <Check /> : <Copy />}
            {copied ? 'Copied' : 'Copy Markdown'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={download}
            disabled={streaming}
          >
            <Download />
            Download .md
          </Button>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <article
          className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-card-foreground prose-h1:text-2xl prose-h2:mt-8 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:text-xl prose-h3:text-base prose-p:text-card-foreground/90 prose-li:text-card-foreground/90 prose-strong:text-card-foreground prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-a:text-primary prose-table:text-sm prose-th:text-card-foreground prose-td:text-card-foreground/90"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          {streaming && (
            <span className="inline-block h-4 w-2 animate-pulse rounded-sm bg-primary align-middle" />
          )}
          {streaming && markdown.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Drafting your PRD...
            </p>
          )}
        </article>
      </div>
    </div>
  )
}
