import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import type { SignUpV1Type } from "./types/SignUpV1Type.js"

export async function apiGenerateEmailSignUpV1(
  props: SignUpV1Type,
  baseUrl: string,
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailSignUpV1"
  return generateEmailApiCall(op, emailTemplateName.signUpV1, props, baseUrl)
}
