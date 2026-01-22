import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/decks/search?q=query&tags=tag1,tag2
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''
  const tagsParam = searchParams.get('tags')
  const tagIds = tagsParam ? tagsParam.split(',').filter(Boolean) : []

  // Build where clause
  const where: Prisma.DeckWhereInput = {
    userId: session.user.id
  }

  // Add text search if query exists
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } }
    ]
  }

  // Add tag filter if tags specified
  if (tagIds.length > 0) {
    where.tags = {
      some: {
        tagId: { in: tagIds }
      }
    }
  }

  const decks = await prisma.deck.findMany({
    where,
    include: {
      _count: {
        select: { cards: true }
      },
      tags: {
        include: {
          tag: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  // Transform the response
  const transformedDecks = decks.map(deck => ({
    ...deck,
    tags: deck.tags.map(dt => dt.tag)
  }))

  return NextResponse.json(transformedDecks)
}
