import * as a from "valibot"
import type { InvitationV1Type } from "../../../client/types/InvitationV1Type.js"
import { footerV1SchemaFields } from "./parts/footerV1SchemaFields.js"
import { languageSchemaFields } from "./parts/languageSchemaFields.js"
import { stringSchema, stringSchema500 } from "./parts/stringSchema.js"

export const invitationV1Schema = a.pipe(
  a.object({
    ...languageSchemaFields,
    invitedName: a.pipe(stringSchema, a.description("Name of the person being invited")),
    invitedByName: a.pipe(stringSchema, a.description("Name of the person who sent the invitation")),
    invitedByEmail: a.pipe(stringSchema, a.description("Email of the person who sent the invitation")),
    entity: a.optional(a.pipe(stringSchema, a.description("Type of entity: team, organization, etc."))),
    entityName: a.pipe(stringSchema, a.description("Name of the team or organization sending the invitation")),
    url: a.pipe(stringSchema500, a.description("URL to accept the invitation")),
    ...footerV1SchemaFields,
  }),
  a.metadata({
    title: "Invitation Email",
    description: "Email template for team or organization invitations",
    examples: [
      {
        l: "en",
        invitedName: "John Doe",
        invitedByName: "Jane Smith",
        invitedByEmail: "jane@example.com",
        entity: "organization",
        entityName: "Acme Inc",
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

type InvitationV1SchemaType = a.InferOutput<typeof invitationV1Schema>

function types1(d: InvitationV1SchemaType): InvitationV1Type {
  return { ...d }
}

export const orgInvitationV1Schema = invitationV1Schema
export const teamInvitationV1Schema = invitationV1Schema
