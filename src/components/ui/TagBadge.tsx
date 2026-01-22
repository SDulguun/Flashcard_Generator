'use client'

interface TagBadgeProps {
  name: string
  color?: string
  selected?: boolean
  onClick?: () => void
  onRemove?: () => void
  size?: 'sm' | 'md'
}

export default function TagBadge({
  name,
  color = '#ec4899',
  selected = false,
  onClick,
  onRemove,
  size = 'md'
}: TagBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium transition-all
        ${sizeClasses}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${selected
          ? 'ring-2 ring-offset-2 ring-[var(--primary-400)]'
          : ''
        }
      `}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: color
      }}
      onClick={onClick}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:opacity-70"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}
