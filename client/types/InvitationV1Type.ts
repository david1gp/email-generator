import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface InvitationV1Type extends MayHaveLanguageType, FooterV1Type {
  invitedName: string
  invitedByName: string
  invitedByEmail?: string
  entity?: string
  entityName: string
  url: string
}