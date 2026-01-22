import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  calculateNextReview,
  getQualityFromResponse,
  calculateXP,
} from '@/lib/spacedRepetition'

// GET progress and cards due for review
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deckId')
    const dueOnly = searchParams.get('due') === 'true'

    const now = new Date()

    // Build where clause
    const whereClause: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (deckId) {
      whereClause.card = { deckId }
    }

    if (dueOnly) {
      whereClause.nextReview = { lte: now }
    }

    const progress = await prisma.progress.findMany({
      where: whereClause,
      include: {
        card: {
          include: {
            deck: true,
          },
        },
      },
      orderBy: { nextReview: 'asc' },
    })

    // Also get cards without progress (new cards)
    if (deckId) {
      const cardsWithProgress = progress.map((p) => p.cardId)
      const newCards = await prisma.card.findMany({
        where: {
          deckId,
          id: { notIn: cardsWithProgress },
        },
        include: {
          deck: true,
        },
      })

      // Return both progress and new cards
      return NextResponse.json({
        progress,
        newCards,
        dueCount: progress.filter((p) => new Date(p.nextReview) <= now).length,
        newCount: newCards.length,
      })
    }

    return NextResponse.json({
      progress,
      dueCount: progress.filter((p) => new Date(p.nextReview) <= now).length,
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

// POST - record a review with spaced repetition
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardId, response } = await request.json()

    if (!cardId || !response) {
      return NextResponse.json(
        { error: 'Card ID and response required' },
        { status: 400 }
      )
    }

    // Get quality from response (again, hard, good, easy)
    const quality = getQualityFromResponse(response)

    // Get current progress
    const currentProgress = await prisma.progress.findUnique({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId,
        },
      },
    })

    // Calculate next review using SM-2
    const result = calculateNextReview(
      quality,
      currentProgress
        ? {
            easeFactor: currentProgress.easeFactor,
            interval: currentProgress.interval,
            reviewCount: currentProgress.reviewCount,
          }
        : undefined
    )

    // Get user for streak calculation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastStudy = user?.lastStudyDate ? new Date(user.lastStudyDate) : null
    if (lastStudy) {
      lastStudy.setHours(0, 0, 0, 0)
    }

    // Calculate streak
    let newStreak = user?.streak ?? 0
    if (!lastStudy) {
      newStreak = 1
    } else {
      const daysDiff = Math.floor(
        (today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysDiff === 0) {
        // Same day, keep streak
      } else if (daysDiff === 1) {
        // Next day, increment streak
        newStreak += 1
      } else {
        // Missed days, reset streak
        newStreak = 1
      }
    }

    // Calculate XP
    const xpEarned = calculateXP(quality, newStreak)

    // Update or create progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_cardId: {
          userId: session.user.id,
          cardId,
        },
      },
      update: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        nextReview: result.nextReview,
        reviewCount: (currentProgress?.reviewCount ?? 0) + 1,
        mastery: result.mastery,
        lastStudied: new Date(),
      },
      create: {
        userId: session.user.id,
        cardId,
        easeFactor: result.easeFactor,
        interval: result.interval,
        nextReview: result.nextReview,
        reviewCount: 1,
        mastery: result.mastery,
      },
    })

    // Update user streak and XP
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        streak: newStreak,
        lastStudyDate: new Date(),
        totalXp: (user?.totalXp ?? 0) + xpEarned,
      },
    })

    return NextResponse.json({
      progress,
      xpEarned,
      streak: newStreak,
      nextReview: result.nextReview,
      interval: result.interval,
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
