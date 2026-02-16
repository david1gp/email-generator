import * as v from "valibot"
import { language } from "@client/i18n/language"
import { languageSchema } from "@client/i18n/languageSchema"

export const languageSchemaFields = {
  l: v.fallback(languageSchema, language.en),
} as const
