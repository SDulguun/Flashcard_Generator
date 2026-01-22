'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DeckForm from '@/components/deck/DeckForm'
import FileUpload from '@/components/deck/FileUpload'
import Card from '@/components/ui/Card'

interface GeneratedCard {
  front: string
  back: string
}

export default function NewDeckPage() {
  const { status } = useSession()
  const router = useRouter()
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([])
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [generatedDescription, setGeneratedDescription] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleCardsGenerated = (
    cards: GeneratedCard[],
    title: string,
    description: string
  ) => {
    setGeneratedCards(cards)
    setGeneratedTitle(title)
    setGeneratedDescription(description)
    setShowForm(true)
  }

  const handleSubmit = async (data: {
    title: string
    description: string
    cards: { front: string; back: string }[]
  }) => {
    const res = await fetch('/api/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Failed to create deck')
    }

    router.push('/dashboard')
  }

  const resetForm = () => {
    setGeneratedCards([])
    setGeneratedTitle('')
    setGeneratedDescription('')
    setShowForm(false)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-bounce block">🌸</span>
          <p className="text-[var(--primary-500)] mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--primary-600)]">Create New Deck</h1>
        <p className="text-[var(--slate-500)] mt-1">
          Upload a file to auto-generate cards, or create them manually!
        </p>
      </div>

      {/* File Upload Section */}
      {!showForm && (
        <>
          <FileUpload onCardsGenerated={handleCardsGenerated} />

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--border-color)]" />
            <span className="text-[var(--slate-400)] text-sm">or create manually</span>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>
        </>
      )}

      {/* Success message when cards are generated */}
      {showForm && generatedCards.length > 0 && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-semibold">
                🎉 Generated {generatedCards.length} flashcards!
              </p>
              <p className="text-green-500 text-sm">
                Review and edit the cards below, then save your deck.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="text-green-600 hover:text-green-700 text-sm underline"
            >
              Start over
            </button>
          </div>
        </Card>
      )}

      {/* Deck Form */}
      <DeckForm
        initialTitle={generatedTitle}
        initialDescription={generatedDescription}
        initialCards={
          generatedCards.length > 0
            ? generatedCards
            : [{ front: '', back: '' }]
        }
        onSubmit={handleSubmit}
        submitLabel="Create Deck 🌸"
        key={generatedCards.length} // Reset form when cards change
      />
    </div>
  )
}
