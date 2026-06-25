import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { buildUserPrompt, PRD_SYSTEM_PROMPT } from '@/components/prd/build-prompt'
import type { PrdData } from '@/components/prd/types'

// Allow up to 60s for the model to produce a full PRD.
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

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5'),
      system: PRD_SYSTEM_PROMPT,
      prompt: buildUserPrompt(data),
      maxOutputTokens: 4000,
    })

    return Response.json({ markdown: text })
  } catch (err) {
    console.log('[v0] PRD generation error:', err)
    return Response.json(
      { error: 'Failed to generate the PRD. Please try again.' },
      { status: 500 },
    )
  }
}
