'use client'

import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search decks...' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const debounceRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)

    // Debounce the onChange callback
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      onChange(newValue)
    }, 300)
  }

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--slate-400)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--slate-400)] focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
      />
      {localValue && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--slate-400)] hover:text-[var(--slate-600)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
