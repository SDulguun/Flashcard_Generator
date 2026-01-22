'use client'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DeckForm from '@/components/deck/DeckForm'

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

export default function EditDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

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

  const handleSubmit = async (data: {
    title: string
    description: string
    cards: { front: string; back: string }[]
  }) => {
    const res = await fetch(`/api/decks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Failed to update deck')
    }

    router.push(`/decks/${id}`)
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/decks/${id}`}
          className="text-[var(--primary-500)] hover:text-[var(--primary-600)] text-sm mb-2 inline-block"
        >
          ← Back to Deck
        </Link>
        <h1 className="text-3xl font-bold text-[var(--primary-600)]">Edit Deck</h1>
        <p className="text-[var(--slate-500)] mt-1">
          Update your deck title, description, and cards!
        </p>
      </div>

      <DeckForm
        initialTitle={deck.title}
        initialDescription={deck.description || ''}
        initialCards={deck.cards.map((c) => ({ front: c.front, back: c.back }))}
        onSubmit={handleSubmit}
        submitLabel="Save Changes 💾"
      />
    </div>
  )
}
