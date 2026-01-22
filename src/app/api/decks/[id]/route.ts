import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET single deck
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deck = await prisma.deck.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        cards: true,
      },
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    return NextResponse.json(deck)
  } catch (error) {
    console.error('Error fetching deck:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deck' },
      { status: 500 }
    )
  }
}

// PUT update deck
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, cards } = await request.json()

    // Verify ownership
    const existingDeck = await prisma.deck.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existingDeck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    // Delete existing cards and create new ones
    await prisma.card.deleteMany({
      where: { deckId: id },
    })

    const deck = await prisma.deck.update({
      where: { id },
      data: {
        title,
        description,
        cards: {
          create: cards?.map((card: { front: string; back: string }) => ({
            front: card.front,
            back: card.back,
          })) || [],
        },
      },
      include: {
        cards: true,
      },
    })

    return NextResponse.json(deck)
  } catch (error) {
    console.error('Error updating deck:', error)
    return NextResponse.json(
      { error: 'Failed to update deck' },
      { status: 500 }
    )
  }
}

// DELETE deck
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existingDeck = await prisma.deck.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existingDeck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    await prisma.deck.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deck:', error)
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    )
  }
}
