import { type PromiseResult, createError, createResult } from "@adaptive-ds/result"
import * as a from "valibot"
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
  const schema = a.pipe(a.string(), a.parseJson(), generatedEmailSchema)
  const parsing = a.safeParse(schema, text)
  if (!parsing.success) {
    return createError(op, a.summarize(parsing.issues), text)
  }
  return createResult(parsing.output)
}

export const generatedEmailSchema = a.object({
  subject: a.string(),
  text: a.string(),
  html: a.string(),
})
