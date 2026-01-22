'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import AsciiArt from '@/components/ui/AsciiArt'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations('auth.register')
  const tError = useTranslations('auth.errors')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('errors.passwordLength'))
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      // Auto login after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError(tError('somethingWrong'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <AsciiArt variant="star" size="sm" className="mb-2" />
          <h1 className="text-2xl font-bold text-[var(--primary-600)] mt-2">{t('title')}</h1>
          <p className="text-[var(--primary-400)] mt-1">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[var(--error-light)] text-[var(--error)] p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <Input
            label={t('name')}
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label={t('email')}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label={t('password')}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label={t('confirmPassword')}
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? t('creatingAccount') : t('button')}
          </Button>
        </form>

        <p className="text-center text-[var(--slate-500)] mt-4 text-sm">
          {t('hasAccount')}{' '}
          <Link href="/login" className="text-[var(--primary-500)] font-semibold hover:underline">
            {t('signIn')}
          </Link>
        </p>
      </Card>
    </div>
  )
}
