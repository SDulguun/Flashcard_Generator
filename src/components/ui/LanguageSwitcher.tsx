'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config'

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie and reload
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    window.location.reload()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[var(--primary-100)] transition-colors text-sm"
        aria-label="Select language"
      >
        <span>{localeFlags[locale]}</span>
        <span className="hidden sm:inline text-[var(--foreground)]">
          {localeNames[locale]}
        </span>
        <svg
          className={`w-4 h-4 text-[var(--slate-500)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-[var(--card-bg)] rounded-xl shadow-lg border border-[var(--border-color)] py-1 z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full px-4 py-2 text-left hover:bg-[var(--primary-50)] transition-colors flex items-center gap-2 ${
                loc === locale ? 'bg-[var(--primary-50)] text-[var(--primary-600)]' : 'text-[var(--foreground)]'
              }`}
            >
              <span>{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
              {loc === locale && (
                <svg className="w-4 h-4 ml-auto text-[var(--primary-500)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
