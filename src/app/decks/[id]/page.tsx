'use client'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

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

export default function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleExport = (format: 'json' | 'csv' | 'anki') => {
    window.location.href = `/api/decks/${id}/export?format=${format}`
    setShowExportMenu(false)
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDeck()
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-bounce block">🌸</span>
          <p className="text-[var(--primary-500)] mt-2">Loading deck...</p>
        </div>
      </div>
    )
  }

  if (!deck) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            href="/dashboard"
            className="text-[var(--primary-500)] hover:text-[var(--primary-600)] text-sm mb-2 inline-block"
          >
            ← Back to Decks
          </Link>
          <h1 className="text-3xl font-bold text-[var(--primary-600)]">{deck.title}</h1>
          {deck.description && (
            <p className="text-[var(--slate-500)] mt-1">{deck.description}</p>
          )}
          <p className="text-[var(--slate-400)] text-sm mt-2">
            📚 {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/decks/${id}/study`}>
            <Button>Study</Button>
          </Link>
          <Link href={`/decks/${id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>

          {/* Export dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--card-bg)] rounded-lg shadow-lg border border-[var(--border-color)] z-10">
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2 text-left text-[var(--foreground)] hover:bg-[var(--slate-100)] rounded-t-lg"
                >
                  JSON (Full data)
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-[var(--foreground)] hover:bg-[var(--slate-100)]"
                >
                  CSV (Spreadsheet)
                </button>
                <button
                  onClick={() => handleExport('anki')}
                  className="w-full px-4 py-2 text-left text-[var(--foreground)] hover:bg-[var(--slate-100)] rounded-b-lg"
                >
                  Anki (Tab-separated)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--primary-600)]">Cards Preview</h2>
        {deck.cards.map((card, index) => (
          <Card key={card.id}>
            <div className="flex items-start gap-4">
              <span className="text-[var(--primary-400)] font-bold">#{index + 1}</span>
              <div className="flex-1 grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[var(--primary-500)] text-xs font-semibold mb-1">FRONT</p>
                  <p className="text-[var(--foreground)]">{card.front}</p>
                </div>
                <div>
                  <p className="text-[var(--primary-500)] text-xs font-semibold mb-1">BACK</p>
                  <p className="text-[var(--foreground)]">{card.back}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
