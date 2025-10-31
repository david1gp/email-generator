import * as v from "valibot"
import { type PromiseResult, createError, createResult } from "~utils/result/Result"
import { apiPathRenderEmailTemplate } from "./apiPathRenderEmailTemplate"
import type { GeneratedEmailType } from "./types/GeneratedEmailType"

export async function generateEmailApiCall<T>(
  op: string,
  name: string,
  props: T,
  baseUrl: string,
): PromiseResult<GeneratedEmailType> {
  const response = await fetch(baseUrl + "/" + apiPathRenderEmailTemplate + "/" + name, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(props),
  })
  const text = await response.text()
  if (!response.ok) {
    return createError(op, response.statusText, text)
  }
  const schema = v.pipe(v.string(), v.parseJson(), generatedEmailSchema)
  const parsing = v.safeParse(schema, text)
  if (!parsing.success) {
    return createError(op, v.summarize(parsing.issues), text)
  }
  return createResult(parsing.output)
}

export const generatedEmailSchema = v.object({
  subject: v.string(),
  text: v.string(),
  html: v.string(),
})
