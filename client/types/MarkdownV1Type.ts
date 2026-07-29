import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface MarkdownV1Type extends MayHaveLanguageType, FooterV1Type {
  subject: string
  preview?: string
  heading?: string
  markdown: string
}
