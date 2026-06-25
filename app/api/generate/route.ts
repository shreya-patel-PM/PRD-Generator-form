import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { buildUserPrompt, PRD_SYSTEM_PROMPT } from '@/components/prd/build-prompt'
import type { PrdData } from '@/components/prd/types'

// Stream the response so we never hit the 60s serverless timeout while waiting
// for the full PRD to finish generating.
export const maxDuration = 60

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured.' },
      { status: 500 },
    )
  }

  let data: PrdData
  try {
    data = (await req.json()) as PrdData
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: PRD_SYSTEM_PROMPT,
    prompt: buildUserPrompt(data),
    maxOutputTokens: 16384,
    onError: ({ error }) => {
      console.log('[v0] PRD streaming error:', error)
    },
  })

  // Plain text stream — the client reads it progressively with a stream reader.
  return result.toTextStreamResponse()
}
