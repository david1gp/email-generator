import * as v from "valibot"
import { language } from "./i18n/language"
import { languageSchema } from "./i18n/languageSchema"

export type RegisterEmailV1Type = v.InferOutput<typeof registerEmailV1Schema>

export const registerEmailV1Schema = v.object({
  l: v.fallback(languageSchema, language.en),
  code: v.string(),
  url: v.string(),
  homepageText: v.string(),
  homepageUrl: v.string(),
  mottoText: v.string(),
})
