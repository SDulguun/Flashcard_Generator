'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Button from '@/components/ui/Button'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { useTheme } from '@/components/ThemeProvider'

/**
 * Navigation Bar Component
 *
 * Displays the main navigation with logo, links, theme toggle, and user auth status.
 */
export default function Navbar() {
  const { data: session } = useSession()
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations('nav')

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <nav className="bg-[var(--card-bg)] border-b border-[var(--border-color)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and brand */}
          <Link href="/" className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-pink-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="text-xl font-semibold text-[var(--foreground)]">{t('brand')}</span>
          </Link>

          {/* Navigation links */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--slate-100)] transition-colors"
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {resolvedTheme === 'dark' ? (
                // Sun icon for dark mode (click to switch to light)
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                // Moon icon for light mode (click to switch to dark)
                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="secondary" size="sm">
                    {t('myDecks')}
                  </Button>
                </Link>
                <span className="text-[var(--slate-500)] text-sm hidden sm:inline">
                  {session.user?.name || session.user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  {t('signOut')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    {t('signIn')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">{t('getStarted')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
