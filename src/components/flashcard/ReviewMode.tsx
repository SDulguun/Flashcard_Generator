'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatInterval, getMasteryInfo } from '@/lib/spacedRepetition'

interface CardData {
  id: string
  front: string
  back: string
}

interface ReviewModeProps {
  cards: CardData[]
  onComplete: (reviewedCount: number) => void
}

type ResponseType = 'again' | 'hard' | 'good' | 'easy'

export default function ReviewMode({ cards, onComplete }: ReviewModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lastInterval, setLastInterval] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleResponse = async (response: ResponseType) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const currentCard = cards[currentIndex]

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentCard.id,
          response,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setXpEarned((prev) => prev + data.xpEarned)
        setStreak(data.streak)
        setLastInterval(data.interval)
        setReviewedCount((prev) => prev + 1)

        // Move to next card or complete
        if (currentIndex + 1 >= cards.length) {
          onComplete(reviewedCount + 1)
        } else {
          setCurrentIndex(currentIndex + 1)
          setIsFlipped(false)
        }
      }
    } catch (error) {
      console.error('Failed to save progress:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">🎉</span>
        <h2 className="text-2xl font-bold text-[var(--primary-600)] mb-2">
          All caught up!
        </h2>
        <p className="text-[var(--primary-500)]">
          No cards due for review. Come back later!
        </p>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-6 bg-[var(--card-bg)] rounded-xl p-3 border-2 border-[var(--primary-100)]">
        <div className="flex items-center gap-4">
          <span className="text-[var(--primary-500)] font-semibold">
            {currentIndex + 1} / {cards.length}
          </span>
          {streak > 0 && (
            <span className="text-orange-500 font-semibold">
              🔥 {streak} day streak
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--primary-600)] font-bold">
            +{xpEarned} XP ⭐
          </span>
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="flip-card w-full h-72 cursor-pointer mb-6"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`flip-card-inner relative w-full h-full ${isFlipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flip-card-front absolute w-full h-full bg-[var(--card-bg)] rounded-2xl border-2 border-[var(--primary-200)] shadow-lg flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-[var(--primary-400)] text-xs font-semibold mb-2">QUESTION</p>
              <p className="text-xl text-[var(--foreground)]">{currentCard.front}</p>
              <p className="text-[var(--primary-300)] text-sm mt-6">Click to reveal answer</p>
            </div>
          </div>

          {/* Back */}
          <div className="flip-card-back absolute w-full h-full bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl border-2 border-[var(--primary-300)] shadow-lg flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-pink-100 text-xs font-semibold mb-2">ANSWER</p>
              <p className="text-xl text-white">{currentCard.back}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Response buttons - only show when flipped */}
      {isFlipped && (
        <div className="space-y-4">
          <p className="text-center text-[var(--primary-500)] text-sm mb-2">
            How well did you know this?
          </p>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleResponse('again')}
              disabled={isSubmitting}
              className="flex flex-col items-center p-3 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50"
            >
              <span className="text-2xl mb-1">😓</span>
              <span className="text-red-600 font-semibold text-sm">Again</span>
              <span className="text-red-400 text-xs">1 day</span>
            </button>

            <button
              onClick={() => handleResponse('hard')}
              disabled={isSubmitting}
              className="flex flex-col items-center p-3 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-all disabled:opacity-50"
            >
              <span className="text-2xl mb-1">🤔</span>
              <span className="text-orange-600 font-semibold text-sm">Hard</span>
              <span className="text-orange-400 text-xs">1 day</span>
            </button>

            <button
              onClick={() => handleResponse('good')}
              disabled={isSubmitting}
              className="flex flex-col items-center p-3 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all disabled:opacity-50"
            >
              <span className="text-2xl mb-1">😊</span>
              <span className="text-green-600 font-semibold text-sm">Good</span>
              <span className="text-green-400 text-xs">~6 days</span>
            </button>

            <button
              onClick={() => handleResponse('easy')}
              disabled={isSubmitting}
              className="flex flex-col items-center p-3 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all disabled:opacity-50"
            >
              <span className="text-2xl mb-1">🤩</span>
              <span className="text-blue-600 font-semibold text-sm">Easy</span>
              <span className="text-blue-400 text-xs">~15 days</span>
            </button>
          </div>

          {lastInterval !== null && (
            <p className="text-center text-[var(--primary-400)] text-sm">
              Last card: next review in {formatInterval(lastInterval)}
            </p>
          )}
        </div>
      )}

      {!isFlipped && (
        <p className="text-center text-[var(--primary-400)] text-sm">
          Click the card to see the answer, then rate your recall
        </p>
      )}
    </div>
  )
}
