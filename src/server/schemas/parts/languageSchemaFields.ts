import { language } from "../../../../client/i18n/language.js"
import { languageSchema } from "../../../../client/i18n/languageSchema.js"
import * as a from "valibot"

export const languageSchemaFields = {
  l: a.fallback(languageSchema, language.en),
} as const
