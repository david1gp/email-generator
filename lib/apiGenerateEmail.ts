import * as v from "valibot"
import { emailTemplateName } from "~/emailTemplateName"
import { generatedEmailSchema } from "~/GeneratedEmailType"
import type { LoginCodeV1Type } from "~/loginCodeV1Schema"
import type { RegisterEmailV1Type } from "~/registerEmailV1Schema"
import { createError, createResult, type PromiseResult } from "~/result/Result"
import { apiRoutePathGenerateEmail } from "./apiRoutePathGenerateEmail"

export type SuccessResponseType = v.InferOutput<typeof successResponseSchema>

export const successResponseSchema = v.object({
  success: v.literal(true),
  data: generatedEmailSchema,
})

const baseUrl = "http://localhost:3055"

export async function apiGenerateEmailLoginCodeV1(props: LoginCodeV1Type): PromiseResult<SuccessResponseType> {
  const op = "apiGenerateEmailLoginCodeV1"
  return apiCall(op, emailTemplateName.loginCodeV1, props)
}

export async function apiGenerateRegisterEmailV1(props: RegisterEmailV1Type): PromiseResult<SuccessResponseType> {
  const op = "apiGenerateRegisterEmailV1"
  return apiCall(op, emailTemplateName.registerEmailV1, props)
}

async function apiCall<T>(op: string, name: string, props: T): PromiseResult<SuccessResponseType> {
  const response = await fetch(baseUrl + "/" + apiRoutePathGenerateEmail + "/" + name, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(props),
  })
  const text = await response.text()
  if (!response.ok) {
    return createError(op, response.statusText, text)
  }
  const schema = v.pipe(v.string(), v.parseJson(), successResponseSchema)
  const parsing = v.safeParse(schema, text)
  if (!parsing.success) {
    return createError(op, v.summarize(parsing.issues), text)
  }
  return createResult(parsing.output)
}
