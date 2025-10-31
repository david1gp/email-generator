import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"
import type { SignUpV1Type } from "~/types/SignUpV1Type"

export const signUpV1Schema = v.object({
  ...languageSchemaFields,
  code: stringSchema,
  url: stringSchema500,
  ...footerV1SchemaFields,
})

type SignUpV1SchemaType = v.InferOutput<typeof signUpV1Schema>

function types1(d: SignUpV1SchemaType): SignUpV1Type {
  return { ...d }
}
