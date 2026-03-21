import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface SignInV1Type extends MayHaveLanguageType, FooterV1Type {
  code: string
  url: string
}
