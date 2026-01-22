'use client'

import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TagBadge from '@/components/ui/TagBadge'

interface Tag {
  id: string
  name: string
  color: string
}

/**
 * Deck Card Component
 *
 * Displays a single deck in the dashboard grid.
 * Shows title, description, card count, tags, and action buttons.
 */
interface DeckCardProps {
  id: string
  title: string
  description: string | null
  cardCount: number
  tags?: Tag[]
  onDelete: (id: string) => void
}

export default function DeckCard({
  id,
  title,
  description,
  cardCount,
  tags,
  onDelete,
}: DeckCardProps) {
  return (
    <Card hover className="flex flex-col">
      <div className="flex-1">
        <Link href={`/decks/${id}`}>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 hover:text-pink-500 transition-colors">
            {title}
          </h3>
        </Link>
        {description && (
          <p className="text-[var(--slate-500)] text-sm mb-3 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center gap-2 text-[var(--slate-400)] text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>{cardCount} {cardCount === 1 ? 'card' : 'cards'}</span>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.map(tag => (
              <TagBadge
                key={tag.id}
                name={tag.name}
                color={tag.color}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
        <Link href={`/decks/${id}/study`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full">
            Study
          </Button>
        </Link>
        <Link href={`/decks/${id}/edit`}>
          <Button variant="secondary" size="sm" title="Edit deck">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(id)}
          title="Delete deck"
        >
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </Card>
  )
}
