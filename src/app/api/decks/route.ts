import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all decks for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decks = await prisma.deck.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { cards: true },
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Transform tags to flat array
    const transformedDecks = decks.map(deck => ({
      ...deck,
      tags: deck.tags.map(dt => dt.tag)
    }))

    return NextResponse.json(transformedDecks)
  } catch (error) {
    console.error('Error fetching decks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    )
  }
}

// POST create new deck
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, cards, tagIds } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const deck = await prisma.deck.create({
      data: {
        title,
        description,
        userId: session.user.id,
        cards: {
          create: cards?.map((card: { front: string; back: string }) => ({
            front: card.front,
            back: card.back,
          })) || [],
        },
        tags: tagIds?.length > 0 ? {
          create: tagIds.map((tagId: string) => ({
            tagId
          }))
        } : undefined,
      },
      include: {
        cards: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
    })

    return NextResponse.json({
      ...deck,
      tags: deck.tags.map(dt => dt.tag)
    })
  } catch (error) {
    console.error('Error creating deck:', error)
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    )
  }
}
