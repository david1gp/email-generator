import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface TeamInvitationV1Type extends MayHaveLanguageType, FooterV1Type {
  invitedName: string
  invitedByName: string
  invitedByEmail?: string
  teamName: string
  url: string
}
