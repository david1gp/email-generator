import { footerV1SchemaFields } from "./parts/footerV1SchemaFields.js"
import { languageSchemaFields } from "./parts/languageSchemaFields.js"
import { stringSchema, stringSchema500 } from "./parts/stringSchema.js"
import type { TeamInvitationV1Type } from "../../../client/types/TeamInvitationV1Type.js"
import * as a from "valibot"

export const teamInvitationV1Schema = a.pipe(
  a.object({
    ...languageSchemaFields,
    invitedName: a.pipe(stringSchema, a.description("Name of the person being invited")),
    invitedByName: a.pipe(stringSchema, a.description("Name of the person who sent the invitation")),
    invitedByEmail: a.pipe(stringSchema, a.description("Email of the person who sent the invitation")),
    teamName: a.pipe(stringSchema, a.description("Name of the team sending the invitation")),
    url: a.pipe(stringSchema500, a.description("URL to accept the team invitation")),
    ...footerV1SchemaFields,
  }),
  a.metadata({
    title: "Team Invitation Email",
    description: "Email template for team invitations",
    examples: [
      {
        l: "en",
        invitedName: "John Doe",
        invitedByName: "Jane Smith",
        invitedByEmail: "jane@example.com",
        teamName: "Engineering Team",
        url: "https://example.com/invitation/abc123",
        homepageText: "You've been invited",
        homepageUrl: "https://example.com",
        hompageSubtitle: "Join our team",
        companyName: "Example Corp",
        companyAddress: "123 Main St, City, Country",
        supportEmail: "support@example.com",
        privacyPolicyUrl: "https://example.com/privacy",
        termsOfServiceUrl: "https://example.com/terms",
      },
    ],
  }),
)

type TeamInvitationV1SchemaType = a.InferOutput<typeof teamInvitationV1Schema>

function types1(d: TeamInvitationV1SchemaType): TeamInvitationV1Type {
  return { ...d }
}
