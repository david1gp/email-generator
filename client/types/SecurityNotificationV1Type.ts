import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface SecurityNotificationV1Type extends MayHaveLanguageType, FooterV1Type {
  event: "emailOtpRequested" | "emailOtpVerified" | "emailOtpFailed" | "impersonationStarted" | "impersonationEnded"
  subject: string
  preview?: string
  heading?: string
  greeting?: string
  message: string
  details?: readonly { label: string; value: string }[]
}
