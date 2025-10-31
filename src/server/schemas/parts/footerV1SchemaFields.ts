import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"
import type { FooterV1Type } from "~/index"

export const footerV1SchemaFields = {
  homepageText: stringSchema,
  homepageUrl: stringSchema,
  hompageSubtitle: stringSchema500,
} as const

const footerV1Schema = v.object(footerV1SchemaFields)
type FooterV1T = v.InferOutput<typeof footerV1Schema>

function types1(a: FooterV1T): FooterV1Type {
  return a
}

function types2(a: FooterV1Type): FooterV1T {
  return a
}
