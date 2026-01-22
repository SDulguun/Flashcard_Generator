import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET public deck by share token (no authentication required)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const deck = await prisma.deck.findFirst({
      where: {
        shareToken: token,
        isPublic: true,
      },
      include: {
        cards: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found or not publicly shared' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: deck.id,
      title: deck.title,
      description: deck.description,
      cards: deck.cards,
      createdBy: deck.user.name || 'Anonymous',
      cardCount: deck.cards.length,
    })
  } catch (error) {
    console.error('Error fetching public deck:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deck' },
      { status: 500 }
    )
  }
}
