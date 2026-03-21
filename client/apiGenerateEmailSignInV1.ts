import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import type { SignInV1Type } from "./types/SignInV1Type.js"


export async function apiGenerateEmailSignInV1(
  props: SignInV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailSignInV1"
  return generateEmailApiCall(op, emailTemplateName.signInV1, props, baseUrl)
}
