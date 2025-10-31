import { type EmailTemplateName } from "~/emailTemplateName"

export const imageHostingPrefix = "https://f003.backblazeb2.com/file/email-generator-images"

export const emailTemplateScreenshot = {
  signUpV1: `${imageHostingPrefix}/signUpV1.jpg`,
  signInV1: `${imageHostingPrefix}/signInV1.jpg`,
  orgInvitationV1: `${imageHostingPrefix}/orgInvitationV1.jpg`,
} as const satisfies Record<EmailTemplateName, string>
