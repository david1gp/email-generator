import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"
import type { OrgInvitationV1Type } from "~/types/OrgInvitationV1Type"

export const orgInvitationV1Schema = v.pipe(
  v.object({
    ...languageSchemaFields,
    invitedName: v.pipe(stringSchema, v.description("Name of the person being invited")),
    invitedByName: v.pipe(stringSchema, v.description("Name of the person who sent the invitation")),
    invitedByEmail: v.pipe(stringSchema, v.description("Email of the person who sent the invitation")),
    orgName: v.pipe(stringSchema, v.description("Name of the organization sending the invitation")),
    url: v.pipe(stringSchema500, v.description("URL to accept the organization invitation")),
    ...footerV1SchemaFields,
  }),
  v.metadata({
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

type OrgInvitationV1SchemaType = v.InferOutput<typeof orgInvitationV1Schema>

function types1(d: OrgInvitationV1SchemaType): OrgInvitationV1Type {
  return { ...d }
}
