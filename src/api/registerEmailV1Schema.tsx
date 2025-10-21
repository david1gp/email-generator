import * as v from "valibot"
import { language } from "../../lib/i18n/language"
import { languageSchema } from "../../lib/i18n/languageSchema"

export const registerEmailV1Schema = v.object({
  l: v.fallback(languageSchema, language.en),
  code: v.string(),
  url: v.string(),
  homepageText: v.string(),
  homepageUrl: v.string(),
  mottoText: v.string(),
})
