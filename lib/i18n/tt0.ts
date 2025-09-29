import { language, type Language } from "~/i18n/language"
import { stringReplaceX } from "~/i18n/stringReplaceX"
import type { TranslationBlock } from "~/i18n/TranslationBlock"

export function tt0(l: Language, b: TranslationBlock): string {
  if (!b) return ""
  return b[l]
}
export function tt1(l: Language, b: TranslationBlock, x: string | number): string {
  return stringReplaceX(b[l], x)
}
export function tt1p(b: TranslationBlock, x: string | number): TranslationBlock {
  return {
    en: stringReplaceX(b[language.en], x),
    de: stringReplaceX(b[language.de], x),
  }
}
export function tt2(l: Language, b: TranslationBlock, x1: string | number, x2: string | number): string {
  return b[l].replace("[X1]", x1.toString()).replace("[X2]", x2.toString())
}
export function tt3(
  l: Language,
  b: TranslationBlock,
  x1: string | number,
  x2: string | number,
  x3: string | number,
): string {
  return b[l].replace("[X1]", x1.toString()).replace("[X2]", x2.toString()).replace("[X3]", x3.toString())
}
