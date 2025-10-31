import type { PromiseResult } from "~utils/result/Result"
import { emailTemplateName } from "./emailTemplateName"
import { generateEmailApiCall } from "./generateEmailApiCall"
import type { GeneratedEmailType } from "./types/GeneratedEmailType"
import type { SignUpV1Type } from "./types/SignUpV1Type"


export async function apiGenerateEmailSignUpV1(
  props: SignUpV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailSignUpV1"
  return generateEmailApiCall(op, emailTemplateName.signUpV1, props, baseUrl)
}
