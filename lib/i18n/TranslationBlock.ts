export type TranslationBlock = {
  en: string
  de: string
}
export type TranslationRecord<T extends string> = Record<T, TranslationBlock>

export const emptyTranslationBlock = {
  en: "",
  de: "",
} as const
