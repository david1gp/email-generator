import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface SignUpV1Type extends MayHaveLanguageType, FooterV1Type {
  code: string
  url: string

  /** overrides the email subject and heading */
  subject?: string
  /** overrides the “copy and paste this code” instruction */
  codeLabel?: string
  /** overrides the “or use the magic link” instruction */
  magicLinkText?: string
  /** overrides the CTA button text */
  buttonText?: string
  /** overrides the “copy and paste this URL” instruction */
  copyAndPasteUrlText?: string
}
