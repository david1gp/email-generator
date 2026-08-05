import * as a from "valibot"
import { stringSchema, stringSchema500 } from "./stringSchema.js"

/** Optional override for a fixed template string (body/CTA/instruction). */
export const overrideStringSchema = a.optional(
  a.pipe(stringSchema500, a.description("Optional override for a fixed template string")),
)

/** Optional override for a short label. */
export const overrideLabelSchema = a.optional(
  a.pipe(stringSchema, a.description("Optional override for a fixed template label")),
)
