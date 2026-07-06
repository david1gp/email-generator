import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import type { PasswordChangeV1Type } from "./types/PasswordChangeV1Type.js"

export async function apiGenerateEmailPasswordChangeV1(
  props: PasswordChangeV1Type,
  baseUrl: string,
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailPasswordChangeV1"
  return generateEmailApiCall(op, emailTemplateName.passwordChangeV1, props, baseUrl)
}
