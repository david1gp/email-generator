import { tt2 } from "../../i18n/tt0.js"
import TeamInvitationV1Template from "../../templates/team_invitation/TeamInvitationV1Template.js"
import { t4teamInvitation } from "../../templates/team_invitation/t4teamInvitation.js"
import { render } from "@react-email/render"
import { language } from "../../../client/i18n/language.js"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType.js"
import type { TeamInvitationV1Type } from "../../../client/types/TeamInvitationV1Type.js"

export async function renderTeamInvitationV1(p: TeamInvitationV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt2(l, t4teamInvitation.Join_x2, p.invitedByName, p.teamName)
  return {
    subject,
    text: await render(<TeamInvitationV1Template {...p} />, { plainText: true }),
    html: await render(<TeamInvitationV1Template {...p} />),
  }
}
