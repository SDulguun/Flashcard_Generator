import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

interface GeneratedCard {
  front: string
  back: string
}

interface GenerateFlashcardsResult {
  cards: GeneratedCard[]
  title: string
  description: string
}

const SYSTEM_PROMPT = `You are an expert educator who creates effective flashcards for studying.

Given the text content, generate flashcards that:
1. Cover the most important concepts, terms, and definitions
2. Use clear, concise language
3. Have questions/terms on the front and answers/definitions on the back
4. Are suitable for spaced repetition learning
5. Avoid overly complex or compound questions

Return your response as a JSON object with this exact structure:
{
  "title": "A short title for this deck (3-6 words)",
  "description": "A brief description of what this deck covers",
  "cards": [
    {"front": "Question or term", "back": "Answer or definition"},
    ...
  ]
}

Generate 10-20 flashcards depending on the content length. Focus on the most important concepts.`

export async function generateFlashcardsFromText(
  content: string
): Promise<GenerateFlashcardsResult> {
  // Try OpenAI first, then Anthropic
  if (process.env.OPENAI_API_KEY) {
    return generateWithOpenAI(content)
  } else if (process.env.ANTHROPIC_API_KEY) {
    return generateWithAnthropic(content)
  } else {
    throw new Error(
      'No AI API key configured. Please add OPENAI_API_KEY or ANTHROPIC_API_KEY to your .env file.'
    )
  }
}

async function generateWithOpenAI(content: string): Promise<GenerateFlashcardsResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate flashcards from the following content:\n\n${content.slice(0, 15000)}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')

  return {
    title: result.title || 'Generated Flashcards',
    description: result.description || 'Auto-generated from uploaded content',
    cards: result.cards || [],
  }
}

async function generateWithAnthropic(content: string): Promise<GenerateFlashcardsResult> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${SYSTEM_PROMPT}\n\nGenerate flashcards from the following content:\n\n${content.slice(0, 15000)}`,
      },
    ],
  })

  // Extract text content from the response
  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Anthropic')
  }

  // Parse JSON from the response (may be wrapped in markdown code blocks)
  let jsonStr = textContent.text
  const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  const result = JSON.parse(jsonStr)

  return {
    title: result.title || 'Generated Flashcards',
    description: result.description || 'Auto-generated from uploaded content',
    cards: result.cards || [],
  }
}
