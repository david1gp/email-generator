import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"

export const footerV1SchemaFields = {
  homepageText: stringSchema,
  homepageUrl: stringSchema,
  mottoText: stringSchema500,
} as const
