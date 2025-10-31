import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"
import type { OrgInvitationV1Type } from "~/types/OrgInvitationV1Type"

export const orgInvitationV1Schema = v.object({
  ...languageSchemaFields,
  // data
  invitedName: stringSchema,
  invitedByName: stringSchema,
  invitedByEmail: stringSchema,
  orgName: stringSchema,
  url: stringSchema500,
  // footer
  ...footerV1SchemaFields,
})

type OrgInvitationV1SchemaType = v.InferOutput<typeof orgInvitationV1Schema>

function types1(d: OrgInvitationV1SchemaType): OrgInvitationV1Type {
  return { ...d }
}
