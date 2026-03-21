import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import type { OrgInvitationV1Type } from "./types/OrgInvitationV1Type.js"


export async function apiGenerateEmailOrgInvitationV1(
  props: OrgInvitationV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailOrgInvitationV1"
  return generateEmailApiCall(op, emailTemplateName.orgInvitationV1, props, baseUrl)
}
