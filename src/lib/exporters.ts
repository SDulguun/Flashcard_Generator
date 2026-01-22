interface Card {
  front: string
  back: string
}

interface ExportDeck {
  title: string
  description: string | null
  cards: Card[]
  tags?: string[]
}

interface ExportData {
  version: string
  exportedAt: string
  deck: ExportDeck
}

/**
 * Export deck to JSON format
 */
export function exportToJSON(deck: ExportDeck): string {
  const data: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    deck: {
      title: deck.title,
      description: deck.description,
      cards: deck.cards.map(c => ({ front: c.front, back: c.back })),
      tags: deck.tags
    }
  }
  return JSON.stringify(data, null, 2)
}

/**
 * Export deck to CSV format
 * Format: front,back
 */
export function exportToCSV(deck: ExportDeck): string {
  const header = 'front,back'
  const rows = deck.cards.map(card => {
    const front = escapeCSV(card.front)
    const back = escapeCSV(card.back)
    return `${front},${back}`
  })
  return [header, ...rows].join('\n')
}

/**
 * Export deck to Anki-compatible tab-separated format
 * Format: front\tback
 */
export function exportToAnki(deck: ExportDeck): string {
  return deck.cards.map(card => {
    const front = card.front.replace(/\t/g, ' ').replace(/\n/g, '<br>')
    const back = card.back.replace(/\t/g, ' ').replace(/\n/g, '<br>')
    return `${front}\t${back}`
  }).join('\n')
}

/**
 * Escape special characters for CSV
 */
function escapeCSV(value: string): string {
  // If value contains comma, newline, or quote, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export type ExportFormat = 'json' | 'csv' | 'anki'

export function getContentType(format: ExportFormat): string {
  switch (format) {
    case 'json':
      return 'application/json'
    case 'csv':
      return 'text/csv'
    case 'anki':
      return 'text/plain'
    default:
      return 'text/plain'
  }
}

export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'json':
      return 'json'
    case 'csv':
      return 'csv'
    case 'anki':
      return 'txt'
    default:
      return 'txt'
  }
}

export function exportDeck(deck: ExportDeck, format: ExportFormat): string {
  switch (format) {
    case 'json':
      return exportToJSON(deck)
    case 'csv':
      return exportToCSV(deck)
    case 'anki':
      return exportToAnki(deck)
    default:
      return exportToJSON(deck)
  }
}
