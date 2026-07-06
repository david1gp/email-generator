import { render } from "@react-email/render"
import { language } from "../../../client/i18n/language.js"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType.js"
import type { InvitationV1Type } from "../../../client/types/InvitationV1Type.js"
import { tt2 } from "../../i18n/tt0.js"
import InvitationV1Template from "../../templates/invitation/InvitationV1Template.js"
import { t4invitation } from "../../templates/invitation/t4invitation.js"

export async function renderInvitationV1(p: InvitationV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const tt = t4invitation(p.entity)
  const subject = tt2(l, tt.Join_x2, p.invitedByName, p.entityName)
  return {
    subject,
    text: await render(<InvitationV1Template {...p} />, { plainText: true }),
    html: await render(<InvitationV1Template {...p} />),
  }
}
