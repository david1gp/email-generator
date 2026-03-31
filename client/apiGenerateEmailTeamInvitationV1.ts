import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import type { TeamInvitationV1Type } from "./types/TeamInvitationV1Type.js"

export async function apiGenerateEmailTeamInvitationV1(
  props: TeamInvitationV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailTeamInvitationV1"
  return generateEmailApiCall(op, emailTemplateName.teamInvitationV1, props, baseUrl)
}
