import { footerV1SchemaFields } from "./parts/footerV1SchemaFields.js"
import { languageSchemaFields } from "./parts/languageSchemaFields.js"
import { stringSchema, stringSchema500 } from "./parts/stringSchema.js"
import type { OrgInvitationV1Type } from "../../../client/types/OrgInvitationV1Type.js"
import * as a from "valibot"

export const orgInvitationV1Schema = a.pipe(
  a.object({
    ...languageSchemaFields,
    invitedName: a.pipe(stringSchema, a.description("Name of the person being invited")),
    invitedByName: a.pipe(stringSchema, a.description("Name of the person who sent the invitation")),
    invitedByEmail: a.pipe(stringSchema, a.description("Email of the person who sent the invitation")),
    orgName: a.pipe(stringSchema, a.description("Name of the organization sending the invitation")),
    url: a.pipe(stringSchema500, a.description("URL to accept the organization invitation")),
    ...footerV1SchemaFields,
  }),
  a.metadata({
    title: "Organization Invitation Email",
    description: "Email template for organization invitations",
    examples: [
      {
        l: "en",
        invitedName: "John Doe",
        invitedByName: "Jane Smith",
        invitedByEmail: "jane@example.com",
        orgName: "Acme Inc",
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

type OrgInvitationV1SchemaType = a.InferOutput<typeof orgInvitationV1Schema>

function types1(d: OrgInvitationV1SchemaType): OrgInvitationV1Type {
  return { ...d }
}
