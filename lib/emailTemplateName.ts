export type EmailTemplateName = keyof typeof emailTemplateName

export const emailTemplateName = {
  signUpV1: "signUpV1",
  signInV1: "signInV1",
  orgInvitationV1: "orgInvitationV1",
  passwordChangeV1: "passwordChangeV1",
} as const
