'use client'

import { useState } from 'react'

interface FlashCardProps {
  front: string
  back: string
}

export default function FlashCard({ front, back }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="flip-card w-full h-64 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`flip-card-inner relative w-full h-full ${isFlipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="flip-card-front absolute w-full h-full bg-[var(--card-bg)] rounded-2xl border-2 border-[var(--primary-200)] shadow-lg flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-[var(--primary-400)] text-xs font-semibold mb-2">QUESTION</p>
            <p className="text-xl text-[var(--foreground)]">{front}</p>
          </div>
        </div>

        {/* Back */}
        <div className="flip-card-back absolute w-full h-full bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl border-2 border-[var(--primary-300)] shadow-lg flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-pink-100 text-xs font-semibold mb-2">ANSWER</p>
            <p className="text-xl text-white">{back}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
