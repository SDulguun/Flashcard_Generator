'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

/**
 * Button Component
 *
 * A reusable button with multiple variants and sizes.
 *
 * @param variant - 'primary' (blue), 'secondary' (gray), 'outline' (bordered), 'danger' (red)
 * @param size - 'sm', 'md', 'lg'
 *
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="outline" onClick={handleClick}>Cancel</Button>
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'btn-primary rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2'

    const variants = {
      primary: 'bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-400',
      secondary: 'bg-pink-50 text-pink-700 hover:bg-pink-100 focus:ring-pink-300',
      outline: 'border border-[var(--border-color)] text-[var(--foreground)] hover:bg-[var(--slate-100)] focus:ring-[var(--slate-400)]',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
