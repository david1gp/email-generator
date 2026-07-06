import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import type { InvitationV1Type } from "./types/InvitationV1Type.js"
import type { OrgInvitationV1Type } from "./types/OrgInvitationV1Type.js"

export async function apiGenerateEmailOrgInvitationV1(
  props: OrgInvitationV1Type,
  baseUrl: string,
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailOrgInvitationV1"
  const serverProps: InvitationV1Type = {
    ...props,
    entity: "organization",
    entityName: props.orgName,
  }
  return generateEmailApiCall(op, emailTemplateName.orgInvitationV1, serverProps, baseUrl)
}
