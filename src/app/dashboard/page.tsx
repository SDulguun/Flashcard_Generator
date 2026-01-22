'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import DeckCard from '@/components/deck/DeckCard'
import SearchBar from '@/components/ui/SearchBar'
import TagBadge from '@/components/ui/TagBadge'

interface Tag {
  id: string
  name: string
  color: string
}

interface Deck {
  id: string
  title: string
  description: string | null
  _count: {
    cards: number
  }
  tags?: Tag[]
}

interface UserStats {
  streak: number
  totalXp: number
  level: number
  xpToNextLevel: number
  dueCount: number
  totalStudied: number
  masteryBreakdown: {
    new: number
    learning: number
    review: number
    mastered: number
  }
}

/**
 * Dashboard Page
 *
 * Main hub for authenticated users. Displays:
 * - Learning statistics (streak, level, cards due)
 * - Progress overview
 * - List of all user's decks
 */
export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('dashboard')
  const [decks, setDecks] = useState<Deck[]>([])
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState<Tag[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch user data when session is available
  useEffect(() => {
    if (session) {
      fetchDecks()
      fetchStats()
      fetchTags()
    }
  }, [session])

  // Filter decks when search query or selected tags change
  const filterDecks = useCallback(async () => {
    if (!searchQuery && selectedTags.length === 0) {
      setFilteredDecks(decks)
      return
    }

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedTags.length > 0) params.set('tags', selectedTags.join(','))

      const res = await fetch(`/api/decks/search?${params}`)
      const data = await res.json()
      setFilteredDecks(data)
    } catch (error) {
      console.error('Failed to search decks:', error)
      setFilteredDecks(decks)
    }
  }, [searchQuery, selectedTags, decks])

  useEffect(() => {
    filterDecks()
  }, [filterDecks])

  const fetchDecks = async () => {
    try {
      const res = await fetch('/api/decks')
      const data = await res.json()
      setDecks(data)
      setFilteredDecks(data)
    } catch (error) {
      console.error('Failed to fetch decks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      setTags(data)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) {
      return
    }

    try {
      await fetch(`/api/decks/${id}`, { method: 'DELETE' })
      setDecks(decks.filter((deck) => deck.id !== id))
      setFilteredDecks(filteredDecks.filter((deck) => deck.id !== id))
    } catch (error) {
      console.error('Failed to delete deck:', error)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[var(--slate-500)] mt-3">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Stats Banner */}
      {stats && stats.masteryBreakdown && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Streak */}
          <Card className="text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{stats.streak || 0}</p>
            <p className="text-[var(--slate-500)] text-sm">{t('stats.streak')}</p>
          </Card>

          {/* Level & XP */}
          <Card className="text-center">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{t('stats.level')} {stats.level || 1}</p>
            <div className="mt-1">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all"
                  style={{ width: `${((100 - (stats.xpToNextLevel || 100)) / 100) * 100}%` }}
                />
              </div>
              <p className="text-[var(--slate-400)] text-xs mt-1">{stats.xpToNextLevel || 100} {t('stats.xpToNext')}</p>
            </div>
          </Card>

          {/* Cards Due */}
          <Card className="text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{stats.dueCount || 0}</p>
            <p className="text-[var(--slate-500)] text-sm">{t('stats.cardsDue')}</p>
          </Card>

          {/* Mastered */}
          <Card className="text-center">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{stats.masteryBreakdown?.mastered || 0}</p>
            <p className="text-[var(--slate-500)] text-sm">{t('stats.mastered')}</p>
          </Card>
        </div>
      )}

      {/* Due Cards Alert */}
      {stats && stats.dueCount && stats.dueCount > 0 && (
        <div className="bg-[var(--primary-50)] rounded-lg p-4 border border-[var(--primary-200)] mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--primary-600)] font-semibold">
                You have {stats.dueCount} cards to review
              </p>
              <p className="text-[var(--primary-500)] text-sm">
                Keep your streak going by reviewing today
              </p>
            </div>
            {decks.length > 0 && (
              <Link href={`/decks/${decks[0].id}/study`}>
                <Button>Start Review</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Mastery Progress */}
      {stats && stats.masteryBreakdown && stats.totalStudied > 0 && (
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">{t('progress.title')}</h3>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-slate-100">
            {(stats.masteryBreakdown.mastered || 0) > 0 && (
              <div
                className="bg-emerald-500 transition-all"
                style={{
                  width: `${((stats.masteryBreakdown.mastered || 0) / stats.totalStudied) * 100}%`,
                }}
                title={`Mastered: ${stats.masteryBreakdown.mastered || 0}`}
              />
            )}
            {(stats.masteryBreakdown.review || 0) > 0 && (
              <div
                className="bg-pink-500 transition-all"
                style={{
                  width: `${((stats.masteryBreakdown.review || 0) / stats.totalStudied) * 100}%`,
                }}
                title={`Review: ${stats.masteryBreakdown.review || 0}`}
              />
            )}
            {(stats.masteryBreakdown.learning || 0) > 0 && (
              <div
                className="bg-orange-500 transition-all"
                style={{
                  width: `${((stats.masteryBreakdown.learning || 0) / stats.totalStudied) * 100}%`,
                }}
                title={`Learning: ${stats.masteryBreakdown.learning || 0}`}
              />
            )}
            {(stats.masteryBreakdown.new || 0) > 0 && (
              <div
                className="bg-slate-300 transition-all"
                style={{
                  width: `${((stats.masteryBreakdown.new || 0) / stats.totalStudied) * 100}%`,
                }}
                title={`New: ${stats.masteryBreakdown.new || 0}`}
              />
            )}
          </div>
          <div className="flex justify-between mt-3 text-xs text-[var(--slate-500)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              {t('progress.mastered')}: {stats.masteryBreakdown.mastered || 0}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              {t('progress.review')}: {stats.masteryBreakdown.review || 0}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              {t('progress.learning')}: {stats.masteryBreakdown.learning || 0}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
              {t('progress.new')}: {stats.masteryBreakdown.new || 0}
            </span>
          </div>
        </Card>
      )}

      {/* Decks Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('title')}</h1>
          <p className="text-[var(--slate-500)] mt-1">
            {filteredDecks.length} {filteredDecks.length === 1 ? t('deck') : t('decks')}
            {(searchQuery || selectedTags.length > 0) && ` (${t('filteredFrom')} ${decks.length})`}
          </p>
        </div>
        <Link href="/decks/new">
          <Button>{t('createDeck')}</Button>
        </Link>
      </div>

      {/* Search and Filter */}
      {decks.length > 0 && (
        <div className="mb-6 space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('searchPlaceholder')}
          />

          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[var(--slate-500)] text-sm">{t('filterByTag')}</span>
              {tags.map(tag => (
                <TagBadge
                  key={tag.id}
                  name={tag.name}
                  color={tag.color}
                  selected={selectedTags.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                  size="sm"
                />
              ))}
              {(searchQuery || selectedTags.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="text-[var(--slate-400)] hover:text-[var(--slate-600)] text-sm underline ml-2"
                >
                  {t('clearFilters')}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {decks.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {t('empty.title')}
          </h2>
          <p className="text-[var(--slate-500)] mb-6">
            {t('empty.subtitle')}
          </p>
          <Link href="/decks/new">
            <Button>{t('empty.button')}</Button>
          </Link>
        </Card>
      ) : filteredDecks.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {t('noMatch.title')}
          </h2>
          <p className="text-[var(--slate-500)] mb-6">
            {t('noMatch.subtitle')}
          </p>
          <Button variant="outline" onClick={clearFilters}>
            {t('clearFilters')}
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              id={deck.id}
              title={deck.title}
              description={deck.description}
              cardCount={deck._count.cards}
              tags={deck.tags}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
