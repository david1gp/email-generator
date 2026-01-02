import type { FooterV1Type } from "./FooterV1Type"
import type { MayHaveLanguageType } from "./MayHaveLanguageType"

export interface PasswordChangeV1Type extends MayHaveLanguageType, FooterV1Type {
  userName?: string
  code: string
  url: string
  expiryMinutes?: number
  supportUrl?: string
}
