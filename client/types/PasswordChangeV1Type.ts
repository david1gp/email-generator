import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface PasswordChangeV1Type extends MayHaveLanguageType, FooterV1Type {
  userName?: string
  code: string
  url: string
  expiryMinutes?: number
  supportUrl?: string

  /** overrides the email subject and heading */
  subject?: string
  /** overrides the greeting line */
  greeting?: string
  /** overrides the request intro paragraph (full paragraph when set) */
  requestText?: string
  /** overrides the “your password change code is” instruction */
  codeLabel?: string
  /** overrides the “or use the magic link” instruction */
  magicLinkText?: string
  /** overrides the CTA button text */
  buttonText?: string
  /** overrides the “copy and paste this URL” instruction */
  copyAndPasteUrlText?: string
  /** overrides the expiry notice */
  expiryText?: string
  /** overrides the “if you didn’t request this” text */
  ignoreText?: string
  /** overrides the “contact support” link/text */
  contactSupportText?: string
}
