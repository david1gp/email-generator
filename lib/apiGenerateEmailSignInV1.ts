import type { PromiseResult } from "~utils/result/Result"
import { emailTemplateName } from "./emailTemplateName"
import { generateEmailApiCall } from "./generateEmailApiCall"
import type { GeneratedEmailType } from "./types/GeneratedEmailType"
import type { SignInV1Type } from "./types/SignInV1Type"


export async function apiGenerateEmailSignInV1(
  props: SignInV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailSignInV1"
  return generateEmailApiCall(op, emailTemplateName.signInV1, props, baseUrl)
}
