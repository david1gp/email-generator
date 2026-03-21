import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface OrgInvitationV1Type extends MayHaveLanguageType, FooterV1Type {
  invitedName: string
  invitedByName: string
  invitedByEmail?: string
  orgName: string
  url: string
}
