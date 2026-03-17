import type { FooterV1Type } from "./FooterV1Type"
import type { MayHaveLanguageType } from "./MayHaveLanguageType"

export interface SignInV1Type extends MayHaveLanguageType, FooterV1Type {
  code: string
  url: string
}
