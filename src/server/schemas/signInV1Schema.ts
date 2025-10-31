import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"
import { language } from "~/i18n/language"
import { languageSchema } from "~/i18n/languageSchema"
import type { SignInV1Type } from "~/types/SignInV1Type"

export const signInV1Schema = v.object({
  ...languageSchemaFields,
  l: v.fallback(languageSchema, language.en),
  code: stringSchema,
  url: stringSchema500,
  ...footerV1SchemaFields,
})

type SignInV1SchemaType = v.InferOutput<typeof signInV1Schema>

function types1(d: SignInV1SchemaType): SignInV1Type {
  return { ...d }
}
