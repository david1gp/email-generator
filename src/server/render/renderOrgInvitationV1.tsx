import { tt2 } from "@/i18n/tt0"
import OrgInvitationV1Template from "@/templates/org_invitation/OrgInvitationV1Template"
import { t4orgInvitation } from "@/templates/org_invitation/t4orgInvitation"
import { render } from "@react-email/render"
import { language } from "~/i18n/language"
import type { GeneratedEmailType } from "~/types/GeneratedEmailType"
import type { OrgInvitationV1Type } from "~/types/OrgInvitationV1Type"

export async function renderOrgInvitationV1(p: OrgInvitationV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt2(l, t4orgInvitation.Join_x2, p.invitedByName, p.orgName)
  return {
    subject,
    text: await render(<OrgInvitationV1Template {...p} />, { plainText: true }),
    html: await render(<OrgInvitationV1Template {...p} />),
  }
}
