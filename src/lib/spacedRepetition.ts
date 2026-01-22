/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo 2 algorithm
 *
 * Quality ratings:
 * 0 - Complete failure, no recall
 * 1 - Incorrect, but remembered after seeing answer
 * 2 - Incorrect, but answer seemed easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect response, instant recall
 */

export type Quality = 0 | 1 | 2 | 3 | 4 | 5

export interface ReviewResult {
  easeFactor: number
  interval: number
  nextReview: Date
  mastery: number
}

export interface CardProgress {
  easeFactor: number
  interval: number
  reviewCount: number
}

/**
 * Calculate the next review based on SM-2 algorithm
 */
export function calculateNextReview(
  quality: Quality,
  currentProgress?: CardProgress
): ReviewResult {
  const now = new Date()

  // Default values for new cards
  let easeFactor = currentProgress?.easeFactor ?? 2.5
  let interval = currentProgress?.interval ?? 0
  const reviewCount = (currentProgress?.reviewCount ?? 0) + 1

  // SM-2 Algorithm
  if (quality < 3) {
    // Failed - reset to beginning
    interval = 1
    // Mastery goes down
  } else {
    // Passed - calculate new interval
    if (reviewCount === 1) {
      interval = 1
    } else if (reviewCount === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }

    // Update ease factor based on quality
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    // Ease factor minimum is 1.3
    easeFactor = Math.max(1.3, easeFactor)
  }

  // Calculate next review date
  const nextReview = new Date(now)
  nextReview.setDate(nextReview.getDate() + interval)

  // Calculate mastery level based on interval
  let mastery = 0
  if (interval === 0) {
    mastery = 0 // New
  } else if (interval < 7) {
    mastery = 1 // Learning
  } else if (interval < 30) {
    mastery = 2 // Review
  } else {
    mastery = 3 // Mastered
  }

  return {
    easeFactor,
    interval,
    nextReview,
    mastery,
  }
}

/**
 * Get quality rating from user response
 * - "again" = 0 (complete fail)
 * - "hard" = 2 (incorrect but easy)
 * - "good" = 4 (correct with hesitation)
 * - "easy" = 5 (perfect)
 */
export function getQualityFromResponse(response: 'again' | 'hard' | 'good' | 'easy'): Quality {
  switch (response) {
    case 'again': return 0
    case 'hard': return 2
    case 'good': return 4
    case 'easy': return 5
  }
}

/**
 * Calculate XP earned from a review
 */
export function calculateXP(quality: Quality, streak: number): number {
  const baseXP = quality >= 3 ? 10 : 2
  const streakBonus = Math.min(streak, 7) // Max 7x bonus
  return baseXP + (quality >= 3 ? streakBonus : 0)
}

/**
 * Get mastery label and color
 */
export function getMasteryInfo(mastery: number): { label: string; color: string; emoji: string } {
  switch (mastery) {
    case 0:
      return { label: 'New', color: 'text-gray-500', emoji: '🆕' }
    case 1:
      return { label: 'Learning', color: 'text-orange-500', emoji: '📖' }
    case 2:
      return { label: 'Review', color: 'text-blue-500', emoji: '🔄' }
    case 3:
      return { label: 'Mastered', color: 'text-green-500', emoji: '⭐' }
    default:
      return { label: 'New', color: 'text-gray-500', emoji: '🆕' }
  }
}

/**
 * Format interval for display
 */
export function formatInterval(interval: number): string {
  if (interval === 0) return 'New'
  if (interval === 1) return '1 day'
  if (interval < 7) return `${interval} days`
  if (interval < 30) return `${Math.round(interval / 7)} weeks`
  if (interval < 365) return `${Math.round(interval / 30)} months`
  return `${Math.round(interval / 365)} years`
}
