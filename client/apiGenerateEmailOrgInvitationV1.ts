import type { PromiseResult } from "~utils/result/Result"
import { emailTemplateName } from "./emailTemplateName"
import { generateEmailApiCall } from "./generateEmailApiCall"
import type { GeneratedEmailType } from "./types/GeneratedEmailType"
import type { OrgInvitationV1Type } from "./types/OrgInvitationV1Type"


export async function apiGenerateEmailOrgInvitationV1(
  props: OrgInvitationV1Type,
  baseUrl: string
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailOrgInvitationV1"
  return generateEmailApiCall(op, emailTemplateName.orgInvitationV1, props, baseUrl)
}
