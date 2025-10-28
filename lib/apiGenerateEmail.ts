import * as v from "valibot"
import type { GeneratedEmailType } from "~/GeneratedEmailType"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { apiPathGenerateEmail } from "./apiPathGenerateEmail"
import { emailTemplateName } from "./emailTemplateName"
import type { LoginCodeV1Type } from "./LoginCodeV1Type"
import type { RegisterEmailV1Type } from "./RegisterEmailV1Type"

export async function apiGenerateEmailLoginCodeV1(
  props: LoginCodeV1Type,
  baseUrl: string,
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailLoginCodeV1"
  return generateEmailApiCall(op, emailTemplateName.loginCodeV1, props, baseUrl)
}

export async function apiGenerateRegisterEmailV1(
  props: RegisterEmailV1Type,
  baseUrl: string,
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateRegisterEmailV1"
  return generateEmailApiCall(op, emailTemplateName.registerEmailV1, props, baseUrl)
}

async function generateEmailApiCall<T>(
  op: string,
  name: string,
  props: T,
  baseUrl: string,
): PromiseResult<GeneratedEmailType> {
  const response = await fetch(baseUrl + "/" + apiPathGenerateEmail + "/" + name, {
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
