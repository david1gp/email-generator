import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface OrgInvitationV1Type extends MayHaveLanguageType, FooterV1Type {
  invitedName: string
  invitedByName: string
  invitedByEmail?: string
  orgName: string
  url: string

  /** overrides the email subject and preview */
  subject?: string
  /** overrides the visible heading */
  heading?: string
  /** overrides the greeting line */
  greeting?: string
  /** overrides the invitation body paragraph */
  body?: string
  /** overrides the CTA button text */
  buttonText?: string
  /** overrides the “copy and paste this URL” instruction */
  copyAndPasteUrlText?: string
}
