export type TranslationBlock = {
  en: string
  de: string
  ru: string
  tj: string
}
export type TranslationRecord<T extends string> = Record<T, TranslationBlock>

export const emptyTranslationBlock = {
  en: "",
  de: "",
  ru: "",
  tj: "",
} as const
