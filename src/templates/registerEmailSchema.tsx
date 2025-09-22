import { language } from "@/i18n/language"
import { languageSchema } from "@/i18n/languageSchema"
import * as v from "valibot"

export type RegisterEmailProps = v.InferOutput<typeof registerEmailSchema>

export const registerEmailSchema = v.object({
  l: v.fallback(languageSchema, language.en),
  code: v.string(),
  url: v.string(),
  homepageText: v.string(),
  homepageUrl: v.string(),
  mottoText: v.string(),
})
