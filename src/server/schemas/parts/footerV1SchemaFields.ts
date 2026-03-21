import { stringSchema, stringSchema500 } from "./stringSchema.js"
import type { FooterV1Type } from "../../../../client/index.js"
import * as a from "valibot"

export const footerV1SchemaFields = {
  homepageText: stringSchema,
  homepageUrl: stringSchema,
  hompageSubtitle: stringSchema500,
} as const

const footerV1Schema = a.object(footerV1SchemaFields)
type FooterV1T = a.InferOutput<typeof footerV1Schema>

function types1(a: FooterV1T): FooterV1Type {
  return a
}

function types2(a: FooterV1Type): FooterV1T {
  return a
}
