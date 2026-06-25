import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import {
  aiFeatureAddendum,
  buildOnePagerPrompt,
  buildPrFaqPrompt,
  buildUserPrompt,
  ONE_PAGER_SYSTEM_PROMPT,
  PR_FAQ_SYSTEM_PROMPT,
  PRD_SYSTEM_PROMPT,
  serializeAiFeature,
} from '@/components/prd/build-prompt'
import type { PrdData } from '@/components/prd/types'
import type { Mode, OnePagerData, PrFaqData } from '@/components/prd/modes'
import type { AiFeatureData } from '@/components/prd/ai-feature'

// Stream the response so we never hit the 60s serverless timeout while waiting
// for the full document to finish generating.
export const maxDuration = 60

type Payload = Record<string, unknown> & { mode?: Mode }

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured.' },
      { status: 500 },
    )
  }

  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  // Normalize the incoming mode so we accept both the form's keys
  // (one-pager / full / pr-faq) and the alternate aliases
  // (1-pager / full-prd / prfaq).
  const normalizeMode = (raw: unknown): Mode => {
    switch (String(raw ?? '').toLowerCase()) {
      case 'one-pager':
      case '1-pager':
        return 'one-pager'
      case 'pr-faq':
      case 'prfaq':
        return 'pr-faq'
      default:
        return 'full'
    }
  }

  const mode = normalizeMode(body.mode)
  const header = {
    productName: String(body.productName ?? ''),
    authorName: String(body.authorName ?? ''),
  }

  let system: string
  let prompt: string
  if (mode === 'one-pager') {
    system = ONE_PAGER_SYSTEM_PROMPT
    prompt = buildOnePagerPrompt(body as unknown as OnePagerData, header)
  } else if (mode === 'pr-faq') {
    system = PR_FAQ_SYSTEM_PROMPT
    prompt = buildPrFaqPrompt(body as unknown as PrFaqData, header)
  } else {
    system = PRD_SYSTEM_PROMPT
    prompt = buildUserPrompt(body as unknown as PrdData)
  }

  // When the AI Feature toggle is on, the client sends an `aiFeature` object.
  // Append its serialized context and the AI addendum so the eight extra
  // sections are generated for whichever mode is active.
  if (body.aiFeature && typeof body.aiFeature === 'object') {
    system = `${system}\n\n${aiFeatureAddendum(mode)}`
    prompt = `${prompt}\n${serializeAiFeature(body.aiFeature as AiFeatureData)}`
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    system,
    prompt,
    maxOutputTokens: 16384,
    onError: ({ error }) => {
      console.log('[v0] PRD streaming error:', error)
    },
  })

  // Plain text stream — the client reads it progressively with a stream reader.
  return result.toTextStreamResponse()
}
