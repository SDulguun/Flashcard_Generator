import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Get user with stats
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        streak: true,
        totalXp: true,
        lastStudyDate: true,
      },
    })

    // Get total cards due for review
    const dueCount = await prisma.progress.count({
      where: {
        userId: session.user.id,
        nextReview: { lte: now },
      },
    })

    // Get total cards studied (with progress)
    const totalStudied = await prisma.progress.count({
      where: { userId: session.user.id },
    })

    // Get mastery breakdown
    const masteryBreakdown = await prisma.progress.groupBy({
      by: ['mastery'],
      where: { userId: session.user.id },
      _count: true,
    })

    // Calculate level from XP (every 100 XP = 1 level)
    const level = Math.floor((user?.totalXp || 0) / 100) + 1
    const xpToNextLevel = 100 - ((user?.totalXp || 0) % 100)

    return NextResponse.json({
      streak: user?.streak || 0,
      totalXp: user?.totalXp || 0,
      level,
      xpToNextLevel,
      dueCount,
      totalStudied,
      masteryBreakdown: {
        new: masteryBreakdown.find((m) => m.mastery === 0)?._count || 0,
        learning: masteryBreakdown.find((m) => m.mastery === 1)?._count || 0,
        review: masteryBreakdown.find((m) => m.mastery === 2)?._count || 0,
        mastered: masteryBreakdown.find((m) => m.mastery === 3)?._count || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
