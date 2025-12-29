import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"
import { language } from "~/i18n/language"
import { languageSchema } from "~/i18n/languageSchema"
import type { PasswordChangeV1Type } from "~/types/PasswordChangeV1Type"

export const passwordChangeV1Schema = v.object({
  ...languageSchemaFields,
  l: v.fallback(languageSchema, language.en),
  userName: v.optional(stringSchema),
  code: stringSchema,
  url: stringSchema500,
  appName: v.optional(stringSchema),
  expiryMinutes: v.optional(v.number()),
  supportUrl: v.optional(stringSchema),
  ...footerV1SchemaFields,
})

type PasswordChangeV1SchemaType = v.InferOutput<typeof passwordChangeV1Schema>

function types1(d: PasswordChangeV1SchemaType): PasswordChangeV1Type {
  return { ...d }
}
