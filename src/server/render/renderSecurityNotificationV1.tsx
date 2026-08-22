import { render } from "@react-email/render"
import type { SecurityNotificationV1Type } from "../../../client/types/SecurityNotificationV1Type.js"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType.js"
import SecurityNotificationV1Template from "../../templates/security_notification/SecurityNotificationV1Template.js"

export async function renderSecurityNotificationV1(p: SecurityNotificationV1Type): Promise<GeneratedEmailType> {
  const title = p.subject
  return {
    subject: title,
    text: await render(<SecurityNotificationV1Template {...p} />, { plainText: true }),
    html: await render(<SecurityNotificationV1Template {...p} />),
  }
}
