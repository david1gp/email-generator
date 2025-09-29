import type { TranslationBlock } from "~/i18n/TranslationBlock"

export function stringReplaceX(s: string, x: string | number) {
  return s.replaceAll("[X]", x.toString())
}
export function stringReplaceXinTranslationBlock(b: TranslationBlock, x: string | number) {
  return { en: stringReplaceX(b.en, x), de: stringReplaceX(b.de, x) }
}
export function stringReplaceX1(s: string, x1: string | number) {
  return s.replaceAll("[X1]", x1.toString())
}
export function stringReplaceX2(s: string, x2: string | number) {
  return s.replaceAll("[X2]", x2.toString())
}
export function stringReplaceX12(s: string, x1: string | number, x2: string | number) {
  return stringReplaceX2(stringReplaceX1(s, x1), x2)
}
