import type { PromiseResult } from "~utils/result/Result"
import { emailTemplateName } from "./emailTemplateName"
import { generateEmailApiCall } from "./generateEmailApiCall"
import type { GeneratedEmailType } from "./types/GeneratedEmailType"
import type { EmailChangeV1Type } from "./types/EmailChangeV1Type"

export async function apiGenerateEmailEmailChangeV1(
  props: EmailChangeV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailEmailChangeV1"
  return generateEmailApiCall(op, emailTemplateName.emailChangeV1, props, baseUrl)
}