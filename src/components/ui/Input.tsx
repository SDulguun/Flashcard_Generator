'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

/**
 * Input Component
 *
 * A styled form input with optional label and error message.
 *
 * @param label - Label text displayed above the input
 * @param error - Error message displayed below the input
 *
 * @example
 * <Input label="Email" type="email" placeholder="Enter your email" />
 * <Input label="Password" type="password" error="Password is required" />
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--slate-600)] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-lg
            border border-[var(--border-color)]
            bg-[var(--card-bg)] text-[var(--foreground)]
            placeholder:text-[var(--slate-400)]
            focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100
            transition-all duration-200
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
