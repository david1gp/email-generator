import type { FooterV1Type } from "~/types/FooterV1Type"
import type { MayHaveLanguageType } from "~/types/MayHaveLanguageType"

export interface SignUpV1Type extends MayHaveLanguageType, FooterV1Type {
  code: string
  url: string
}
