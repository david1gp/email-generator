import type { FooterV1Type } from "@client/types/FooterV1Type"
import type { MayHaveLanguageType } from "@client/types/MayHaveLanguageType"

export interface SignUpV1Type extends MayHaveLanguageType, FooterV1Type {
  code: string
  url: string
}
