import type { Language } from "./i18n/language"

export type LoginCodeV1Type = {
  l?: Language
  code: string
  url: string
  homepageText: string
  homepageUrl: string
  mottoText: string
}
