import { type EmailTemplateName } from "../../client/emailTemplateName.js"

export const imageHostingPrefix = "https://f003.backblazeb2.com/file/email-generator-images"

export const emailTemplateScreenshot = {
  signUpV1: `${imageHostingPrefix}/signUpV1.jpg`,
  signInV1: `${imageHostingPrefix}/signInV1.jpg`,
  orgInvitationV1: `${imageHostingPrefix}/orgInvitationV1.jpg`,
  passwordChangeV1: `${imageHostingPrefix}/passwordChangeV1.jpg`,
  emailChangeV1: `${imageHostingPrefix}/emailChangeV1.jpg`,
  teamInvitationV1: `${imageHostingPrefix}/teamInvitationV1.jpg`,
} as const satisfies Record<EmailTemplateName, string>
