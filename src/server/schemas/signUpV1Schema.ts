import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"

export const signUpV1Schema = v.object({
  ...languageSchemaFields,
  code: stringSchema,
  url: stringSchema500,
  ...footerV1SchemaFields,
})
