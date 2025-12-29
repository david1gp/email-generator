import type { PromiseResult } from "~utils/result/Result"
import { emailTemplateName } from "./emailTemplateName"
import { generateEmailApiCall } from "./generateEmailApiCall"
import type { GeneratedEmailType } from "./types/GeneratedEmailType"
import type { PasswordChangeV1Type } from "./types/PasswordChangeV1Type"

export async function apiGenerateEmailPasswordChangeV1(
  props: PasswordChangeV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailPasswordChangeV1"
  return generateEmailApiCall(op, emailTemplateName.passwordChangeV1, props, baseUrl)
}