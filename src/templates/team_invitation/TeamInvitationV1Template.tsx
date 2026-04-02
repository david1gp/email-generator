import type { TeamInvitationV1Type } from "../../../client/types/TeamInvitationV1Type.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import InvitationV1Template from "../invitation/InvitationV1Template.js"

export function TeamInvitationV1Template(p: TeamInvitationV1Type) {
  return InvitationV1Template({
    ...p,
    entity: "team",
    entityName: p.teamName,
  })
}

TeamInvitationV1Template.PreviewProps = {
  l: "en",
  invitedName: "Bob",
  invitedByName: "Alice",
  invitedByEmail: "Alice@example.com",
  teamName: "Engineering",
  url: "https://example.com/sign-in?code=ABC123",
  ...footerV1ExampleData,
} as TeamInvitationV1Type

export default TeamInvitationV1Template
