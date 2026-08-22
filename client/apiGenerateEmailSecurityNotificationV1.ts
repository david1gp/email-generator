import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import type { SecurityNotificationV1Type } from "./types/SecurityNotificationV1Type.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"

export async function apiGenerateEmailSecurityNotificationV1(
  props: SecurityNotificationV1Type,
  baseUrl: string,
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailSecurityNotificationV1"
  return generateEmailApiCall(op, emailTemplateName.securityNotificationV1, props, baseUrl)
}
