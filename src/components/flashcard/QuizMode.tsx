'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface CardData {
  id: string
  front: string
  back: string
}

interface QuizModeProps {
  cards: CardData[]
  onComplete: (score: number, total: number) => void
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Track used distractors globally to avoid repetition
let usedDistractors: Set<string> = new Set()

// Reset used distractors when starting a new quiz
function resetUsedDistractors() {
  usedDistractors = new Set()
}

// Generate tricky distractors based on the correct answer
function generateDistractors(correctAnswer: string, question: string): string[] {
  const distractors: string[] = []

  // Strategy 1: Negate or contradict parts of the answer
  const negationPhrases = [
    { find: /\bhelps\b/gi, replace: 'does not help' },
    { find: /\bimproves\b/gi, replace: 'has no effect on' },
    { find: /\bincreases\b/gi, replace: 'decreases' },
    { find: /\bdecreases\b/gi, replace: 'increases' },
    { find: /\bshould\b/gi, replace: 'should not' },
    { find: /\bcan\b/gi, replace: 'cannot' },
    { find: /\bwill\b/gi, replace: 'will not' },
    { find: /\bis\b/gi, replace: 'is not' },
    { find: /\bare\b/gi, replace: 'are not' },
    { find: /\bsuperior\b/gi, replace: 'inferior' },
    { find: /\bhigher\b/gi, replace: 'lower' },
    { find: /\bstrengthens\b/gi, replace: 'weakens' },
    { find: /\bsustainable\b/gi, replace: 'temporary' },
    { find: /\blasting\b/gi, replace: 'short-term' },
    { find: /\bproactive\b/gi, replace: 'reactive' },
    { find: /\bgood\b/gi, replace: 'poor' },
    { find: /\beffective\b/gi, replace: 'ineffective' },
    { find: /\bimportant\b/gi, replace: 'unimportant' },
    { find: /\bessential\b/gi, replace: 'optional' },
    { find: /\brequired\b/gi, replace: 'not required' },
  ]

  // Try to create a negated version
  for (const { find, replace } of negationPhrases) {
    if (find.test(correctAnswer)) {
      const negated = correctAnswer.replace(find, replace)
      if (negated !== correctAnswer && !usedDistractors.has(negated)) {
        distractors.push(negated)
        break
      }
    }
  }

  // Strategy 2: Swap key terms with related but wrong terms
  const termSwaps = [
    { find: /\bcompetitive advantage\b/gi, replace: 'market share' },
    { find: /\bmarket share\b/gi, replace: 'competitive advantage' },
    { find: /\bstrategy\b/gi, replace: 'tactics' },
    { find: /\btactics\b/gi, replace: 'strategy' },
    { find: /\bcustomers\b/gi, replace: 'shareholders' },
    { find: /\bshareholders\b/gi, replace: 'customers' },
    { find: /\bvalue\b/gi, replace: 'cost' },
    { find: /\bcost\b/gi, replace: 'value' },
    { find: /\bprofit\b/gi, replace: 'revenue' },
    { find: /\brevenue\b/gi, replace: 'profit' },
    { find: /\blong-term\b/gi, replace: 'short-term' },
    { find: /\bshort-term\b/gi, replace: 'long-term' },
    { find: /\bexternal\b/gi, replace: 'internal' },
    { find: /\binternal\b/gi, replace: 'external' },
    { find: /\bcompetitors\b/gi, replace: 'partners' },
    { find: /\brivals\b/gi, replace: 'allies' },
    { find: /\bdifferent\b/gi, replace: 'similar' },
    { find: /\bunique\b/gi, replace: 'common' },
    { find: /\bemployee\b/gi, replace: 'management' },
    { find: /\bmanagement\b/gi, replace: 'employee' },
    { find: /\bquality\b/gi, replace: 'quantity' },
    { find: /\bquantity\b/gi, replace: 'quality' },
  ]

  for (const { find, replace } of termSwaps) {
    if (find.test(correctAnswer) && distractors.length < 3) {
      const swapped = correctAnswer.replace(find, replace)
      if (swapped !== correctAnswer && !distractors.includes(swapped) && !usedDistractors.has(swapped)) {
        distractors.push(swapped)
      }
    }
  }

  // Strategy 3: Generate context-aware wrong answers based on question keywords
  const questionLower = question.toLowerCase()
  const answerLower = correctAnswer.toLowerCase()

  const contextualDistractors: string[] = []

  // Ethics-related questions
  if (questionLower.includes('ethic') || questionLower.includes('moral') || questionLower.includes('standard')) {
    contextualDistractors.push(
      'Maximizing profits regardless of social impact',
      'Following only legal requirements without ethical consideration',
      'Delegating all ethical decisions to upper management only',
      'Implementing ethics only when competitors do the same'
    )
  }

  // Strategy-related questions
  if (questionLower.includes('strateg') || questionLower.includes('compet') || questionLower.includes('advantage')) {
    contextualDistractors.push(
      'Reacting to market changes only after competitors act',
      'Maintaining current practices without adaptation',
      'Focusing on cost reduction as the primary objective',
      'Imitating industry leaders without differentiation'
    )
  }

  // Management/leadership questions
  if (questionLower.includes('manage') || questionLower.includes('lead') || questionLower.includes('team')) {
    contextualDistractors.push(
      'Making all decisions at the executive level only',
      'Minimizing employee involvement in decision-making',
      'Prioritizing efficiency over team development',
      'Focusing solely on task completion without feedback'
    )
  }

  // Communication questions
  if (questionLower.includes('communic') || questionLower.includes('inform') || questionLower.includes('share')) {
    contextualDistractors.push(
      'Limiting information to senior management only',
      'Communicating only when problems arise',
      'Using one-way communication channels exclusively',
      'Restricting feedback to annual reviews only'
    )
  }

  // Customer/market questions
  if (questionLower.includes('customer') || questionLower.includes('market') || questionLower.includes('consumer')) {
    contextualDistractors.push(
      'Prioritizing operational efficiency over customer needs',
      'Assuming customer preferences remain constant',
      'Focusing on acquiring new customers only, not retention',
      'Setting prices based solely on competitor pricing'
    )
  }

  // Add generic but complete distractors for other topics
  const genericDistractors = [
    'Taking a reactive approach and waiting for issues to arise',
    'Implementing changes without stakeholder consultation',
    'Maintaining traditional methods despite changing conditions',
    'Prioritizing short-term results over sustainable practices',
    'Delegating responsibility without proper oversight',
    'Following industry norms without critical evaluation',
    'Making decisions based on assumptions rather than data',
    'Implementing policies without measuring their effectiveness'
  ]

  // Combine and filter distractors
  const allContextual = [...contextualDistractors, ...genericDistractors]
  const shuffledContextual = shuffleArray(allContextual)

  for (const distractor of shuffledContextual) {
    if (distractors.length >= 3) break
    if (!distractors.includes(distractor) &&
        distractor !== correctAnswer &&
        !usedDistractors.has(distractor)) {
      distractors.push(distractor)
    }
  }

  // Extra fallback pool if we still need more
  const extraFallbacks = [
    'This approach is generally not recommended by experts',
    'Focusing primarily on avoiding negative outcomes',
    'Relying on external factors rather than internal capabilities',
    'Waiting for clear evidence before taking any action',
    'Minimizing change to reduce potential risks',
    'Deferring decisions to higher authority levels',
    'Applying standardized solutions without customization',
    'Emphasizing compliance over innovation',
    'Reducing complexity by limiting options',
    'Centralizing control to maintain consistency',
    'Prioritizing speed over thoroughness',
    'Limiting scope to manageable boundaries',
    'Accepting current conditions as optimal',
    'Avoiding commitments that limit future flexibility',
    'Treating all situations with the same approach'
  ]

  const shuffledFallbacks = shuffleArray(extraFallbacks)
  for (const fallback of shuffledFallbacks) {
    if (distractors.length >= 3) break
    if (!distractors.includes(fallback) && fallback !== correctAnswer) {
      distractors.push(fallback)
    }
  }

  // Ensure we have exactly 3 unique distractors
  const uniqueDistractors = [...new Set(distractors)]
    .filter(d => d !== correctAnswer && d.length > 5)
    .slice(0, 3)

  // Mark these distractors as used (but allow reuse if pool is exhausted)
  uniqueDistractors.forEach(d => usedDistractors.add(d))

  // If still not enough, clear used cache and try again with fallbacks
  if (uniqueDistractors.length < 3) {
    const emergencyFallbacks = shuffleArray([
      'None of the conventional approaches apply here',
      'The opposite of what is typically recommended',
      'An outdated perspective on this topic',
    ])
    while (uniqueDistractors.length < 3 && emergencyFallbacks.length > 0) {
      const fallback = emergencyFallbacks.pop()
      if (fallback && !uniqueDistractors.includes(fallback)) {
        uniqueDistractors.push(fallback)
      }
    }
  }

  return uniqueDistractors
}

export default function QuizMode({ cards, onComplete }: QuizModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [options, setOptions] = useState<string[]>([])
  const [quizCards, setQuizCards] = useState<CardData[]>([])

  useEffect(() => {
    resetUsedDistractors() // Reset used distractors for new quiz
    setQuizCards(shuffleArray(cards))
  }, [cards])

  useEffect(() => {
    if (quizCards.length > 0 && currentIndex < quizCards.length) {
      generateOptions()
    }
  }, [currentIndex, quizCards])

  const generateOptions = () => {
    const currentCard = quizCards[currentIndex]
    const correctAnswer = currentCard.back

    // Generate tricky distractors based on the correct answer
    const distractors = generateDistractors(correctAnswer, currentCard.front)

    // Combine correct answer with distractors and shuffle
    const allOptions = shuffleArray([correctAnswer, ...distractors])
    setOptions(allOptions)
  }

  const handleAnswer = (answer: string) => {
    if (showResult) return

    setSelectedAnswer(answer)
    setShowResult(true)

    if (answer === quizCards[currentIndex].back) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    if (currentIndex + 1 >= quizCards.length) {
      onComplete(score + (selectedAnswer === quizCards[currentIndex].back ? 1 : 0), quizCards.length)
    } else {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  if (quizCards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--primary-500)]">Loading quiz...</p>
      </div>
    )
  }

  const currentCard = quizCards[currentIndex]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[var(--primary-500)] font-semibold">
          Question {currentIndex + 1} of {quizCards.length}
        </span>
        <span className="text-[var(--primary-600)] font-bold">
          Score: {score} 🌟
        </span>
      </div>

      <Card className="mb-6">
        <p className="text-[var(--primary-400)] text-xs font-semibold mb-2">QUESTION</p>
        <p className="text-xl text-[var(--foreground)] text-center py-4">{currentCard.front}</p>
      </Card>

      <div className="space-y-3">
        {options.map((option, index) => {
          let buttonClass = 'w-full text-left p-4 rounded-xl border-2 transition-all '

          if (showResult) {
            if (option === currentCard.back) {
              buttonClass += 'bg-green-100 border-green-400 text-green-700'
            } else if (option === selectedAnswer) {
              buttonClass += 'bg-red-100 border-red-400 text-red-700'
            } else {
              buttonClass += 'bg-[var(--slate-100)] border-[var(--slate-200)] text-[var(--slate-400)]'
            }
          } else {
            buttonClass += 'bg-[var(--card-bg)] border-[var(--primary-200)] hover:border-[var(--primary-400)] hover:bg-[var(--primary-50)] text-[var(--foreground)] cursor-pointer'
          }

          return (
            <button
              key={index}
              className={buttonClass}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
            >
              <span className="font-semibold text-[var(--primary-400)] mr-2">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          )
        })}
      </div>

      {showResult && (
        <div className="mt-6 text-center">
          {selectedAnswer === currentCard.back ? (
            <p className="text-green-600 font-bold text-lg mb-4">Correct! 🎉</p>
          ) : (
            <p className="text-red-600 font-bold text-lg mb-4">
              Oops! The answer was: {currentCard.back} 💪
            </p>
          )}
          <Button onClick={nextQuestion}>
            {currentIndex + 1 >= quizCards.length ? 'See Results 🌸' : 'Next Question →'}
          </Button>
        </div>
      )}
    </div>
  )
}
