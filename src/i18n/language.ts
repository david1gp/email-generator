export type Language = keyof typeof language
export const language = {
  en: "en",
  de: "de",
} as const

export function isDe(l: Language) {
  return l === language.de
}
export function isEn(l: Language) {
  return l === language.en
}
