export type EmailTemplate = keyof typeof emailTemplate

export const emailTemplate = {
  registerEmailV1: "registerEmailV1",
  loginCodeV1: "loginCodeV1",
} as const
