import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import type { MarkdownV1Type } from "./types/MarkdownV1Type.js"

export async function apiGenerateEmailMarkdownV1(
  props: MarkdownV1Type,
  baseUrl: string,
  token?: string,
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailMarkdownV1"
  const extraHeaders = token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : undefined
  return generateEmailApiCall(op, emailTemplateName.markdownV1, props, baseUrl, extraHeaders)
}
