import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName"
import { generateEmailApiCall } from "./generateEmailApiCall"
import type { EmailChangeV1Type } from "./types/EmailChangeV1Type"
import type { GeneratedEmailType } from "./types/GeneratedEmailType"

export async function apiGenerateEmailEmailChangeV1(
  props: EmailChangeV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailEmailChangeV1"
  return generateEmailApiCall(op, emailTemplateName.emailChangeV1, props, baseUrl)
}
