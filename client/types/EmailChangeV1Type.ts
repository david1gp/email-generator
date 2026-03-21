import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface EmailChangeV1Type extends MayHaveLanguageType, FooterV1Type {
  userName?: string
  code: string
  url: string
  expiryMinutes?: number
  supportUrl?: string
}
