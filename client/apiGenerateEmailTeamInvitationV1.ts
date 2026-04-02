import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import type { InvitationV1Type } from "./types/InvitationV1Type.js"
import type { TeamInvitationV1Type } from "./types/TeamInvitationV1Type.js"

export async function apiGenerateEmailTeamInvitationV1(
  props: TeamInvitationV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailTeamInvitationV1"
  const serverProps: InvitationV1Type = {
    ...props,
    entity: "team",
    entityName: props.teamName,
  }
  return generateEmailApiCall(op, emailTemplateName.teamInvitationV1, serverProps, baseUrl)
}
