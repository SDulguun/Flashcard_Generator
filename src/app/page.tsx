import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import AsciiArt from '@/components/ui/AsciiArt'
import { getTranslations } from 'next-intl/server'

// Icon components
const FlowerIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2C12 2 14.5 5 14.5 8C14.5 11 12 13 12 13C12 13 9.5 11 9.5 8C9.5 5 12 2 12 2Z" fill="#ec4899" stroke="#ec4899"/>
    <path d="M12 13C12 13 15 10.5 18 10.5C21 10.5 22 13 22 13C22 13 21 15.5 18 15.5C15 15.5 12 13 12 13Z" fill="#f472b6" stroke="#f472b6"/>
    <path d="M12 13C12 13 9 10.5 6 10.5C3 10.5 2 13 2 13C2 13 3 15.5 6 15.5C9 15.5 12 13 12 13Z" fill="#f472b6" stroke="#f472b6"/>
    <path d="M12 13C12 13 14.5 16 14.5 19C14.5 22 12 22 12 22C12 22 9.5 22 9.5 19C9.5 16 12 13 12 13Z" fill="#ec4899" stroke="#ec4899"/>
    <circle cx="12" cy="13" r="2" fill="#fbbf24"/>
  </svg>
)

const SparkleIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" className="text-pink-400"/>
  </svg>
)

const BookIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" className="text-pink-500"/>
  </svg>
)

const TargetIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" className="text-pink-500"/>
    <circle cx="12" cy="12" r="6" className="text-pink-400"/>
    <circle cx="12" cy="12" r="2" className="text-pink-500"/>
  </svg>
)

const ChartIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"/>
  </svg>
)

const HeartIcon = ({ className = "w-5 h-5 inline" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" className="text-pink-500"/>
  </svg>
)

const ArrowRightIcon = ({ className = "w-5 h-5 inline ml-1" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default async function HomePage() {
  const t = await getTranslations('home')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <AsciiArt variant="logo" size="sm" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--primary-600)] mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-[var(--primary-500)] mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                {t('hero.getStarted')}
                <ArrowRightIcon />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                {t('hero.login')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-[var(--card-bg)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--primary-600)] text-center mb-12">
            {t('features.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card hover>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <BookIcon className="w-12 h-12 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold text-[var(--primary-600)] mb-2">
                  {t('features.createDecks.title')}
                </h3>
                <p className="text-[var(--primary-500)]">
                  {t('features.createDecks.description')}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <TargetIcon className="w-12 h-12 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold text-[var(--primary-600)] mb-2">
                  {t('features.studyModes.title')}
                </h3>
                <p className="text-[var(--primary-500)]">
                  {t('features.studyModes.description')}
                </p>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <ChartIcon className="w-12 h-12 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold text-[var(--primary-600)] mb-2">
                  {t('features.trackProgress.title')}
                </h3>
                <p className="text-[var(--primary-500)]">
                  {t('features.trackProgress.description')}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <AsciiArt variant="star" size="sm" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--primary-600)] mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-[var(--primary-500)] mb-8">
            {t('cta.subtitle')}
          </p>
          <Link href="/register">
            <Button size="lg">
              {t('cta.button')}
              <ArrowRightIcon />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[var(--primary-50)] border-t-2 border-[var(--primary-100)]">
        <div className="max-w-6xl mx-auto text-center text-[var(--primary-500)]">
          <p className="flex items-center justify-center gap-1">
            {t('footer.madeWith')} <HeartIcon /> {t('footer.by')}
          </p>
        </div>
      </footer>
    </div>
  )
}
