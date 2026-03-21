import { tt2 } from "../../i18n/tt0.js"
import OrgInvitationV1Template from "../../templates/org_invitation/OrgInvitationV1Template.js"
import { t4orgInvitation } from "../../templates/org_invitation/t4orgInvitation.js"
import { render } from "@react-email/render"
import { language } from "../../../client/i18n/language.js"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType.js"
import type { OrgInvitationV1Type } from "../../../client/types/OrgInvitationV1Type.js"

export async function renderOrgInvitationV1(p: OrgInvitationV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt2(l, t4orgInvitation.Join_x2, p.invitedByName, p.orgName)
  return {
    subject,
    text: await render(<OrgInvitationV1Template {...p} />, { plainText: true }),
    html: await render(<OrgInvitationV1Template {...p} />),
  }
}
