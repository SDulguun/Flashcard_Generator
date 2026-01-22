import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// POST - Generate or get share link
export async function POST(
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
    const deck = await prisma.deck.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    // Generate token if not exists
    let shareToken = deck.shareToken
    if (!shareToken) {
      shareToken = randomBytes(16).toString('hex')
    }

    // Update deck with share token and make public
    const updatedDeck = await prisma.deck.update({
      where: { id },
      data: {
        isPublic: true,
        shareToken,
      },
    })

    return NextResponse.json({
      shareToken: updatedDeck.shareToken,
      isPublic: updatedDeck.isPublic,
    })
  } catch (error) {
    console.error('Error sharing deck:', error)
    return NextResponse.json(
      { error: 'Failed to share deck' },
      { status: 500 }
    )
  }
}

// DELETE - Disable sharing
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
    const deck = await prisma.deck.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    // Disable sharing
    await prisma.deck.update({
      where: { id },
      data: {
        isPublic: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disabling share:', error)
    return NextResponse.json(
      { error: 'Failed to disable sharing' },
      { status: 500 }
    )
  }
}
