import type { OrgInvitationV1Type } from "../../../client/types/OrgInvitationV1Type.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import InvitationV1Template from "../invitation/InvitationV1Template.js"

export function OrgInvitationV1Template(p: OrgInvitationV1Type) {
  return InvitationV1Template({
    ...p,
    entity: "organization",
    entityName: p.orgName,
  })
}

OrgInvitationV1Template.PreviewProps = {
  l: "en",
  invitedName: "Bob",
  invitedByName: "Alice",
  invitedByEmail: "Alice@example.com",
  orgName: "Alice Inc",
  url: "https://example.com/sign-in?code=ABC123",
  ...footerV1ExampleData,
} as OrgInvitationV1Type

export default OrgInvitationV1Template
