export const locales = ['en', 'es', 'fr', 'ja', 'zh', 'mn'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ja: '日本語',
  zh: '中文',
  mn: 'Монгол',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  ja: '🇯🇵',
  zh: '🇨🇳',
  mn: '🇲🇳',
}
