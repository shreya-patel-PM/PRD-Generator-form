'use client'

import { useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  Table2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { markdownToConfluence } from './export-converters'

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
  const [copiedKey, setCopiedKey] = useState<
    'markdown' | 'confluence' | 'gdocs' | null
  >(null)

  const flash = (key: 'markdown' | 'confluence' | 'gdocs') => {
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 2000)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(markdown)
    flash('markdown')
  }

  const copyConfluence = async () => {
    await navigator.clipboard.writeText(markdownToConfluence(markdown))
    flash('confluence')
  }

  const copyGoogleDocs = async () => {
    const html = renderToStaticMarkup(
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>,
    )
    try {
      // Write both HTML and plain text so Google Docs picks up rich formatting.
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([markdown], { type: 'text/plain' }),
        }),
      ])
    } catch {
      // Fallback for browsers without ClipboardItem support.
      await navigator.clipboard.writeText(markdown)
    }
    flash('gdocs')
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {streaming && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:mr-1">
              <Loader2 className="size-3.5 animate-spin" />
              Generating...
            </span>
          )}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={copy}
              disabled={streaming}
            >
              {copiedKey === 'markdown' ? <Check /> : <Copy />}
              {copiedKey === 'markdown' ? 'Copied!' : 'Copy Markdown'}
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
            <Button
              variant="outline"
              size="sm"
              onClick={copyConfluence}
              disabled={streaming}
            >
              {copiedKey === 'confluence' ? <Check /> : <Table2 />}
              {copiedKey === 'confluence' ? 'Copied!' : 'Copy for Confluence'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyGoogleDocs}
              disabled={streaming}
            >
              {copiedKey === 'gdocs' ? <Check /> : <FileText />}
              {copiedKey === 'gdocs' ? 'Copied!' : 'Copy for Google Docs'}
            </Button>
          </div>
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
