import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"
import { language } from "~/i18n/language"
import { languageSchema } from "~/i18n/languageSchema"
import type { EmailChangeV1Type } from "~/types/EmailChangeV1Type"

export const emailChangeV1Schema = v.object({
  ...languageSchemaFields,
  l: v.fallback(languageSchema, language.en),
  userName: v.optional(stringSchema),
  code: stringSchema,
  url: stringSchema500,
  expiryMinutes: v.optional(v.number()),
  supportUrl: v.optional(stringSchema),
  ...footerV1SchemaFields,
})

type EmailChangeV1SchemaType = v.InferOutput<typeof emailChangeV1Schema>

function types1(d: EmailChangeV1SchemaType): EmailChangeV1Type {
  return { ...d }
}
