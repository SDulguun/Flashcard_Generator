'use client'

import { useEffect, useState } from 'react'
import Card from './Card'

interface Quote {
  text: string
  author: string
  country: string
}

interface RandomQuotesProps {
  quotes: Quote[]
  title: string
}

export default function RandomQuotes({ quotes, title }: RandomQuotesProps) {
  const [selectedQuotes, setSelectedQuotes] = useState<Quote[]>([])

  useEffect(() => {
    // Shuffle and pick 3 random quotes
    const shuffled = [...quotes].sort(() => Math.random() - 0.5)
    setSelectedQuotes(shuffled.slice(0, 3))
  }, [quotes])

  if (selectedQuotes.length === 0) {
    return null
  }

  return (
    <section className="py-16 px-4 bg-[var(--card-bg)]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-[var(--primary-600)] text-center mb-10">
          {title}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {selectedQuotes.map((quote, index) => (
            <Card key={index}>
              <div className="text-center p-4">
                <p className="text-[var(--primary-600)] italic text-lg mb-4">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p className="text-[var(--primary-400)] font-medium">
                  — {quote.author}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
