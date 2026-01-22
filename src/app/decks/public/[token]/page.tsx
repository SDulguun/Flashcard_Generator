'use client'

import { useEffect, useState, use } from 'react'
import Card from '@/components/ui/Card'

interface CardData {
  id: string
  front: string
  back: string
}

interface PublicDeck {
  id: string
  title: string
  description: string | null
  cards: CardData[]
  createdBy: string
  cardCount: number
}

export default function PublicDeckPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [deck, setDeck] = useState<PublicDeck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchDeck()
  }, [token])

  const fetchDeck = async () => {
    try {
      const res = await fetch(`/api/public/decks/${token}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('This deck is not available or the link has expired.')
        } else {
          setError('Failed to load deck.')
        }
        return
      }
      const data = await res.json()
      setDeck(data)
    } catch (err) {
      console.error('Failed to fetch deck:', err)
      setError('Failed to load deck.')
    } finally {
      setLoading(false)
    }
  }

  const toggleCard = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-bounce block">🌸</span>
          <p className="text-[var(--primary-500)] mt-2">Loading deck...</p>
        </div>
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">😔</span>
          <h1 className="text-2xl font-bold text-[var(--primary-600)] mb-2">Deck Not Found</h1>
          <p className="text-[var(--slate-500)]">{error || 'This deck is not available.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--slate-400)] mb-2">
          <span>🔗</span>
          <span>Shared Deck</span>
          <span>•</span>
          <span>Created by {deck.createdBy}</span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--primary-600)]">{deck.title}</h1>
        {deck.description && (
          <p className="text-[var(--slate-500)] mt-1">{deck.description}</p>
        )}
        <p className="text-[var(--slate-400)] text-sm mt-2">
          📚 {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-[var(--slate-500)] text-sm">
          Click on any card to flip it and reveal the answer.
        </p>
      </div>

      <div className="space-y-4">
        {deck.cards.map((card, index) => (
          <Card
            key={card.id}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => toggleCard(card.id)}
          >
            <div className="flex items-start gap-4">
              <span className="text-[var(--primary-400)] font-bold">#{index + 1}</span>
              <div className="flex-1">
                {flippedCards.has(card.id) ? (
                  <div>
                    <p className="text-[var(--primary-500)] text-xs font-semibold mb-1">ANSWER</p>
                    <p className="text-[var(--foreground)]">{card.back}</p>
                    <p className="text-[var(--slate-400)] text-xs mt-2">Click to see question</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[var(--primary-500)] text-xs font-semibold mb-1">QUESTION</p>
                    <p className="text-[var(--foreground)]">{card.front}</p>
                    <p className="text-[var(--slate-400)] text-xs mt-2">Click to reveal answer</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center text-[var(--slate-400)] text-sm">
        <p>Made with Flashcard Generator 🌸</p>
      </div>
    </div>
  )
}
