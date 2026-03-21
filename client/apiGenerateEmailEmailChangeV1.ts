import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { EmailChangeV1Type } from "./types/EmailChangeV1Type.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"

export async function apiGenerateEmailEmailChangeV1(
  props: EmailChangeV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailEmailChangeV1"
  return generateEmailApiCall(op, emailTemplateName.emailChangeV1, props, baseUrl)
}
