'use client'

interface AsciiArtProps {
  variant: 'logo' | 'flower' | 'star' | 'book' | 'celebration' | 'loading' | 'cards' | 'brain' | 'refresh' | 'question' | 'game'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const artVariants = {
  logo: [
  ' /\\_/\\ ',
  '( o.o )',
  ' > ^ < ',
  '/|   |\\',
  '(_| |_)',
].join('\n'),

  flower: `
   _
  (*)
 __|__
   |`.trim(),

  star: `
    .
   /|\\
  --*--
   \\|/
    '`.trim(),

  book: `
  ____
 /    \\
|  []  |
|______|`.trim(),

  celebration: `
 \\  |  /
  \\ | /
 --***--
  / | \\
 /  |  \\`.trim(),

  loading: `( o o o )`.trim(),

  cards: `
 _____
|Q > A|
|_____|`.trim(),

  brain: `
  ____
 (o  o)
  (__)`.trim(),

  refresh: `
  <-->`.trim(),

  question: `
  (?)`.trim(),

  game: `
 [>.<]`.trim(),
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export default function AsciiArt({ variant, className = '', size = 'md' }: AsciiArtProps) {
  const art = artVariants[variant]

  return (
    <div className={`flex justify-center ${className}`}>
      <pre
        className={`
          font-mono
          whitespace-pre
          text-left
          text-[var(--primary-500)]
          select-none
          ${sizeClasses[size]}
        `}
        aria-hidden="true"
      >
        {art}
      </pre>
    </div>
  )
}

// Compact inline versions for smaller spaces
export function InlineAsciiArt({
  children,
  className = ''
}: {
  children: string
  className?: string
}) {
  return (
    <span
      className={`font-mono text-[var(--primary-500)] ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}
