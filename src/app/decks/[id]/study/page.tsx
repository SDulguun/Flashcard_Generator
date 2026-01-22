'use client'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import AsciiArt from '@/components/ui/AsciiArt'
import FlashCard from '@/components/flashcard/FlashCard'
import QuizMode from '@/components/flashcard/QuizMode'
import MatchMode from '@/components/flashcard/MatchMode'
import ReviewMode from '@/components/flashcard/ReviewMode'

interface CardData {
  id: string
  front: string
  back: string
}

interface Deck {
  id: string
  title: string
  description: string | null
  cards: CardData[]
}

type StudyMode = 'select' | 'flip' | 'quiz' | 'match' | 'review' | 'results'

export default function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<StudyMode>('select')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [results, setResults] = useState({ score: 0, total: 0 })
  const [dueCards, setDueCards] = useState<CardData[]>([])
  const [newCards, setNewCards] = useState<CardData[]>([])
  const [dueCount, setDueCount] = useState(0)
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDeck()
      fetchProgress()
    }
  }, [status, id])

  const fetchDeck = async () => {
    try {
      const res = await fetch(`/api/decks/${id}`)
      if (!res.ok) {
        router.push('/dashboard')
        return
      }
      const data = await res.json()
      setDeck(data)
    } catch (error) {
      console.error('Failed to fetch deck:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/progress?deckId=${id}`)
      const data = await res.json()

      // Cards due for review
      const now = new Date()
      const due = data.progress
        ?.filter((p: { nextReview: string }) => new Date(p.nextReview) <= now)
        .map((p: { card: CardData }) => p.card) || []

      setDueCards(due)
      setNewCards(data.newCards || [])
      setDueCount(data.dueCount || 0)
      setNewCount(data.newCount || 0)
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  const handleQuizComplete = (score: number, total: number) => {
    setResults({ score, total })
    setMode('results')
  }

  const handleMatchComplete = (matched: number, total: number) => {
    setResults({ score: matched, total })
    setMode('results')
  }

  const handleReviewComplete = (reviewedCount: number) => {
    setResults({ score: reviewedCount, total: reviewedCount })
    setMode('results')
  }

  const restartStudy = () => {
    setMode('select')
    setCurrentCardIndex(0)
    setResults({ score: 0, total: 0 })
    fetchProgress() // Refresh due counts
  }

  // Combine due cards and new cards for review mode
  const reviewCards = [...dueCards, ...newCards.slice(0, 10)] // Limit new cards to 10 per session

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AsciiArt variant="loading" size="lg" className="animate-pulse" />
          <p className="text-[var(--primary-500)] mt-2">Loading study session...</p>
        </div>
      </div>
    )
  }

  if (!deck) return null

  if (deck.cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <AsciiArt variant="book" size="lg" className="mb-4" />
        <h1 className="text-2xl font-bold text-[var(--primary-600)] mb-2">No cards yet!</h1>
        <p className="text-[var(--primary-500)] mb-6">Add some cards to this deck first.</p>
        <Link href={`/decks/${id}/edit`}>
          <Button>Add Cards</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/decks/${id}`}
          className="text-[var(--primary-500)] hover:text-[var(--primary-600)] text-sm mb-2 inline-block"
        >
          ← Back to Deck
        </Link>
        <h1 className="text-2xl font-bold text-[var(--primary-600)]">{deck.title}</h1>
      </div>

      {/* Mode Selection */}
      {mode === 'select' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--primary-600)] text-center mb-8">
            Choose Your Study Mode
          </h2>

          {/* Due cards banner */}
          {(dueCount > 0 || newCount > 0) && (
            <div className="bg-[var(--primary-50)] rounded-xl p-4 border-2 border-[var(--primary-200)] mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--foreground)] font-semibold">
                    Cards to Review Today
                  </p>
                  <p className="text-[var(--slate-500)] text-sm">
                    {dueCount} due + {newCount} new cards
                  </p>
                </div>
                <Button onClick={() => setMode('review')} size="sm">
                  Start Review
                </Button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Review Mode - Featured */}
            <Card
              hover
              onClick={() => setMode('review')}
              className="cursor-pointer border-[var(--primary-300)] bg-[var(--primary-50)]"
            >
              <div className="text-center py-4">
                <AsciiArt variant="brain" size="sm" className="mb-3" />
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                  Smart Review
                </h3>
                <p className="text-[var(--slate-500)] text-sm">
                  Spaced repetition - review cards when you need to!
                </p>
                {(dueCount > 0 || newCount > 0) && (
                  <p className="text-[var(--primary-600)] text-xs mt-2 font-semibold">
                    {dueCount + Math.min(newCount, 10)} cards ready
                  </p>
                )}
              </div>
            </Card>

            <Card hover onClick={() => setMode('flip')} className="cursor-pointer">
              <div className="text-center py-4">
                <AsciiArt variant="refresh" size="sm" className="mb-3" />
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Flip Cards</h3>
                <p className="text-[var(--slate-500)] text-sm">
                  Classic flashcard study
                </p>
              </div>
            </Card>

            <Card hover onClick={() => setMode('quiz')} className="cursor-pointer">
              <div className="text-center py-4">
                <AsciiArt variant="question" size="sm" className="mb-3" />
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Quiz Mode</h3>
                <p className="text-[var(--slate-500)] text-sm">
                  Multiple choice questions
                </p>
              </div>
            </Card>

            <Card
              hover
              onClick={() => deck.cards.length >= 4 && setMode('match')}
              className={deck.cards.length < 4 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            >
              <div className="text-center py-4">
                <AsciiArt variant="game" size="sm" className="mb-3" />
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Match Game</h3>
                <p className="text-[var(--slate-500)] text-sm">
                  {deck.cards.length < 4
                    ? 'Need 4+ cards'
                    : 'Match terms'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Review Mode - Spaced Repetition */}
      {mode === 'review' && (
        <div>
          <div className="mb-4">
            <Button variant="outline" size="sm" onClick={() => setMode('select')}>
              ← Change Mode
            </Button>
          </div>
          <ReviewMode cards={reviewCards} onComplete={handleReviewComplete} />
        </div>
      )}

      {/* Flip Mode */}
      {mode === 'flip' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={() => setMode('select')}>
              ← Change Mode
            </Button>
            <span className="text-[var(--primary-500)] font-semibold">
              Card {currentCardIndex + 1} of {deck.cards.length}
            </span>
          </div>

          <FlashCard
            front={deck.cards[currentCardIndex].front}
            back={deck.cards[currentCardIndex].back}
          />

          <p className="text-center text-[var(--primary-400)] text-sm">
            Click the card to flip!
          </p>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
              disabled={currentCardIndex === 0}
            >
              ← Previous
            </Button>
            <Button
              onClick={() => {
                if (currentCardIndex + 1 >= deck.cards.length) {
                  setResults({ score: deck.cards.length, total: deck.cards.length })
                  setMode('results')
                } else {
                  setCurrentCardIndex(currentCardIndex + 1)
                }
              }}
            >
              {currentCardIndex + 1 >= deck.cards.length ? 'Finish' : 'Next'}
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 flex-wrap">
            {deck.cards.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentCardIndex
                    ? 'bg-[var(--primary-500)]'
                    : index < currentCardIndex
                    ? 'bg-[var(--primary-300)]'
                    : 'bg-[var(--primary-100)]'
                }`}
                onClick={() => setCurrentCardIndex(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quiz Mode */}
      {mode === 'quiz' && (
        <div>
          <div className="mb-4">
            <Button variant="outline" size="sm" onClick={() => setMode('select')}>
              ← Change Mode
            </Button>
          </div>
          <QuizMode cards={deck.cards} onComplete={handleQuizComplete} />
        </div>
      )}

      {/* Match Mode */}
      {mode === 'match' && (
        <div>
          <div className="mb-4">
            <Button variant="outline" size="sm" onClick={() => setMode('select')}>
              ← Change Mode
            </Button>
          </div>
          <MatchMode cards={deck.cards} onComplete={handleMatchComplete} />
        </div>
      )}

      {/* Results */}
      {mode === 'results' && (
        <div className="text-center py-12">
          <AsciiArt variant="celebration" size="md" className="mb-4" />
          <h2 className="text-3xl font-bold text-[var(--primary-600)] mb-4">
            Great Job!
          </h2>
          {results.total > 0 && (
            <div className="mb-6">
              <p className="text-xl text-[var(--primary-500)]">
                You reviewed{' '}
                <span className="font-bold text-[var(--primary-600)]">
                  {results.score}
                </span>{' '}
                cards!
              </p>
              <p className="text-[var(--primary-400)] mt-2">
                Keep up the great work!
              </p>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={restartStudy}>
              Study Again
            </Button>
            <Link href={`/decks/${id}`}>
              <Button>Back to Deck</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
