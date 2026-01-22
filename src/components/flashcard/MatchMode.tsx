'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'

interface CardData {
  id: string
  front: string
  back: string
}

interface MatchModeProps {
  cards: CardData[]
  onComplete: (matchedCount: number, totalPairs: number) => void
}

interface MatchItem {
  id: string
  text: string
  type: 'front' | 'back'
  cardId: string
  matched: boolean
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function MatchMode({ cards, onComplete }: MatchModeProps) {
  const [items, setItems] = useState<MatchItem[]>([])
  const [selected, setSelected] = useState<MatchItem | null>(null)
  const [matchedCount, setMatchedCount] = useState(0)
  const [wrongMatch, setWrongMatch] = useState<string | null>(null)

  useEffect(() => {
    // Take first 6 cards max for matching game
    const gameCards = cards.slice(0, 6)

    const frontItems: MatchItem[] = gameCards.map((card) => ({
      id: `front-${card.id}`,
      text: card.front,
      type: 'front',
      cardId: card.id,
      matched: false,
    }))

    const backItems: MatchItem[] = gameCards.map((card) => ({
      id: `back-${card.id}`,
      text: card.back,
      type: 'back',
      cardId: card.id,
      matched: false,
    }))

    setItems(shuffleArray([...frontItems, ...backItems]))
  }, [cards])

  const handleSelect = (item: MatchItem) => {
    if (item.matched) return

    if (!selected) {
      setSelected(item)
      return
    }

    if (selected.id === item.id) {
      setSelected(null)
      return
    }

    // Check if they match (same cardId but different types)
    if (selected.cardId === item.cardId && selected.type !== item.type) {
      // Match found!
      setItems(
        items.map((i) =>
          i.cardId === item.cardId ? { ...i, matched: true } : i
        )
      )
      setMatchedCount(matchedCount + 1)
      setSelected(null)

      // Check if game is complete
      const totalPairs = Math.min(cards.length, 6)
      if (matchedCount + 1 >= totalPairs) {
        setTimeout(() => {
          onComplete(matchedCount + 1, totalPairs)
        }, 500)
      }
    } else {
      // Wrong match
      setWrongMatch(item.id)
      setTimeout(() => {
        setWrongMatch(null)
        setSelected(null)
      }, 500)
    }
  }

  const totalPairs = Math.min(cards.length, 6)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[var(--primary-500)] font-semibold">
          Match the pairs!
        </span>
        <span className="text-[var(--primary-600)] font-bold">
          Matched: {matchedCount}/{totalPairs} ✨
        </span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => {
          let className =
            'p-4 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer min-h-[100px] flex items-center justify-center text-sm '

          if (item.matched) {
            className += 'bg-green-100 border-green-300 text-green-600 cursor-default'
          } else if (wrongMatch === item.id) {
            className += 'bg-red-100 border-red-400 text-red-600 animate-shake'
          } else if (selected?.id === item.id) {
            className += 'bg-[var(--primary-200)] border-[var(--primary-500)] text-[var(--primary-700)]'
          } else {
            className += 'bg-[var(--card-bg)] border-[var(--primary-200)] hover:border-[var(--primary-400)] hover:bg-[var(--primary-50)] text-[var(--foreground)]'
          }

          return (
            <button
              key={item.id}
              className={className}
              onClick={() => handleSelect(item)}
              disabled={item.matched}
            >
              {item.text}
            </button>
          )
        })}
      </div>

      {matchedCount >= totalPairs && (
        <div className="mt-8 text-center">
          <p className="text-2xl text-[var(--primary-600)] font-bold mb-4">
            All matched!
          </p>
          <Button onClick={() => onComplete(matchedCount, totalPairs)}>
            See Results 🌸
          </Button>
        </div>
      )}
    </div>
  )
}
