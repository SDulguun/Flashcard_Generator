'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

interface CardData {
  front: string
  back: string
}

interface DeckFormProps {
  initialTitle?: string
  initialDescription?: string
  initialCards?: CardData[]
  onSubmit: (data: {
    title: string
    description: string
    cards: CardData[]
  }) => Promise<void>
  submitLabel: string
}

export default function DeckForm({
  initialTitle = '',
  initialDescription = '',
  initialCards = [{ front: '', back: '' }],
  onSubmit,
  submitLabel,
}: DeckFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [cards, setCards] = useState<CardData[]>(initialCards)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addCard = () => {
    setCards([...cards, { front: '', back: '' }])
  }

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index))
    }
  }

  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    const newCards = [...cards]
    newCards[index][field] = value
    setCards(newCards)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a deck title')
      return
    }

    const validCards = cards.filter((c) => c.front.trim() && c.back.trim())
    if (validCards.length === 0) {
      setError('Please add at least one card with both front and back')
      return
    }

    setLoading(true)

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        cards: validCards,
      })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-[var(--error-light)] text-[var(--error)] p-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      <Card>
        <h2 className="text-lg font-bold text-[var(--primary-600)] mb-4">Deck Info</h2>
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g., Spanish Vocabulary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-[var(--slate-600)] mb-1.5">
              Description (optional)
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--slate-400)] focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-200 resize-none"
              rows={2}
              placeholder="What's this deck about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--primary-600)]">Cards</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addCard}>
            Add Card +
          </Button>
        </div>

        {cards.map((card, index) => (
          <Card key={index} className="relative">
            <div className="absolute top-2 right-2 text-[var(--primary-400)] text-sm">
              #{index + 1}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--slate-600)] mb-1.5">
                  Front (Question/Term)
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--slate-400)] focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="Enter question or term..."
                  value={card.front}
                  onChange={(e) => updateCard(index, 'front', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--slate-600)] mb-1.5">
                  Back (Answer/Definition)
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--slate-400)] focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-200 resize-none"
                  rows={3}
                  placeholder="Enter answer or definition..."
                  value={card.back}
                  onChange={(e) => updateCard(index, 'back', e.target.value)}
                />
              </div>
            </div>
            {cards.length > 1 && (
              <button
                type="button"
                className="absolute bottom-2 right-2 text-[var(--primary-400)] hover:text-red-500 transition-colors text-sm"
                onClick={() => removeCard(index)}
              >
                Remove 🗑️
              </button>
            )}
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addCard}
        >
          Add Another Card +
        </Button>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
