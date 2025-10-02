export type EmailTemplateName = keyof typeof emailTemplateName

export const emailTemplateName = {
  registerEmailV1: "registerEmailV1",
  loginCodeV1: "loginCodeV1",
} as const
