import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exportDeck, getContentType, getFileExtension, ExportFormat } from '@/lib/exporters'

// GET /api/decks/[id]/export?format=json|csv|anki
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const format = (searchParams.get('format') || 'json') as ExportFormat

  // Fetch deck with cards and tags
  const deck = await prisma.deck.findFirst({
    where: {
      id,
      userId: session.user.id
    },
    include: {
      cards: {
        select: {
          front: true,
          back: true
        }
      },
      tags: {
        include: {
          tag: true
        }
      }
    }
  })

  if (!deck) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
  }

  // Prepare export data
  const exportData = {
    title: deck.title,
    description: deck.description,
    cards: deck.cards,
    tags: deck.tags.map(dt => dt.tag.name)
  }

  // Generate export content
  const content = exportDeck(exportData, format)
  const contentType = getContentType(format)
  const extension = getFileExtension(format)
  const filename = `${deck.title.replace(/[^a-z0-9]/gi, '_')}.${extension}`

  // Return file download
  return new NextResponse(content, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}
