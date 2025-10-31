import type { FooterV1Type } from "~/types/FooterV1Type"
import type { MayHaveLanguageType } from "~/types/MayHaveLanguageType"

export interface OrgInvitationV1Type extends MayHaveLanguageType, FooterV1Type {
  invitedName: string
  invitedByName: string
  invitedByEmail?: string
  orgName: string
  url: string
}
