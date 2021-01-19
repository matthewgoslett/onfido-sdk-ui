export type SupportedLanguages =
  | 'en_US'
  | 'en'
  | 'de_DE'
  | 'de'
  | 'es_ES'
  | 'es'
  | 'fr_FR'
  | 'fr'

export type LocaleConfig = {
  locale?: SupportedLanguages
  phrases: Record<string, unknown>
  mobilePhrases?: Record<string, unknown>
}

export type TranslatedTagHandler = (tag: {
  type: string
  text: string
}) => string | Element

export type TranslatedTagParser = (
  key: string,
  handler: TranslatedTagHandler
) => (string | Element)[]
