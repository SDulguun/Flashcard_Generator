'use client'

import { HTMLAttributes, forwardRef } from 'react'

/**
 * Card Component
 *
 * A container component for grouping related content.
 *
 * @param hover - Enable hover animation effect
 *
 * @example
 * <Card>Content here</Card>
 * <Card hover onClick={handleClick}>Clickable card</Card>
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-[var(--card-bg)] rounded-lg p-6
          border border-[var(--border-color)]
          shadow-sm
          ${hover ? 'card-hover cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
