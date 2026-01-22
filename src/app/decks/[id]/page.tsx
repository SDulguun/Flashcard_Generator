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
  isPublic?: boolean
  shareToken?: string | null
}

export default function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleExport = (format: 'json' | 'csv' | 'anki') => {
    window.location.href = `/api/decks/${id}/export?format=${format}`
    setShowExportMenu(false)
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      const res = await fetch(`/api/decks/${id}/share`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to share')
      const data = await res.json()
      const link = `${window.location.origin}/decks/public/${data.shareToken}`
      setShareLink(link)
      setShowShareModal(true)
    } catch (error) {
      console.error('Failed to share deck:', error)
      alert('Failed to generate share link')
    } finally {
      setSharing(false)
    }
  }

  const copyToClipboard = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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

          {/* Share button */}
          <Button variant="outline" onClick={handleShare} disabled={sharing}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {sharing ? 'Sharing...' : 'Share'}
          </Button>

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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-[var(--card-bg)] rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[var(--primary-600)] mb-4">Share Deck</h3>
            <p className="text-[var(--slate-500)] text-sm mb-4">
              Anyone with this link can view your flashcards (but cannot edit them).
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink || ''}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--slate-50)] text-sm"
              />
              <Button onClick={copyToClipboard}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setShowShareModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
