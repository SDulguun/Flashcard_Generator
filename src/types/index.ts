export interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
}

export interface Deck {
  id: string
  title: string
  description: string | null
  userId: string
  cards: Card[]
  createdAt: Date
  updatedAt: Date
}

export interface Card {
  id: string
  front: string
  back: string
  deckId: string
}

export interface Progress {
  id: string
  userId: string
  cardId: string
  mastery: number
  lastStudied: Date
}

export interface DeckWithCards extends Deck {
  cards: Card[]
  _count?: {
    cards: number
  }
}
