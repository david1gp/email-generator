import { language } from "../../../../client/i18n/language"
import { languageSchema } from "../../../../client/i18n/languageSchema"
import * as a from "valibot"

export const languageSchemaFields = {
  l: a.fallback(languageSchema, language.en),
} as const
