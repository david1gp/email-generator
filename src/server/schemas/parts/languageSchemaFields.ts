import * as v from "valibot"
import { language } from "~/i18n/language"
import { languageSchema } from "~/i18n/languageSchema"

export const languageSchemaFields = {
  l: v.fallback(languageSchema, language.en),
} as const
