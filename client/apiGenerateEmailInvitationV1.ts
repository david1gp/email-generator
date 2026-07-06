import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import type { InvitationV1Type } from "./types/InvitationV1Type.js"

export async function apiGenerateEmailInvitationV1(
  props: InvitationV1Type,
  baseUrl: string,
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailInvitationV1"
  return generateEmailApiCall(op, emailTemplateName.invitationV1, props, baseUrl)
}
