import * as v from "valibot"

export type GeneratedEmailType = v.InferOutput<typeof generatedEmailSchema>

export const generatedEmailSchema = v.object({
  text: v.string(),
  html: v.string(),
})
