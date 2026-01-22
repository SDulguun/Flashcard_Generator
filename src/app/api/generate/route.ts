import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { parseFile } from '@/lib/fileParser'
import { generateFlashcardsFromText } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const text = formData.get('text') as string | null

    let content: string

    if (file) {
      // Parse the uploaded file
      content = await parseFile(file)
    } else if (text) {
      // Use provided text directly
      content = text
    } else {
      return NextResponse.json(
        { error: 'Please provide a file or text content' },
        { status: 400 }
      )
    }

    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        { error: 'Content is too short to generate flashcards' },
        { status: 400 }
      )
    }

    // Generate flashcards using AI
    const result = await generateFlashcardsFromText(content)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating flashcards:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    )
  }
}
