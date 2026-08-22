import * as a from "valibot"
import { language } from "../../../client/i18n/language.js"
import { languageSchema } from "../../../client/i18n/languageSchema.js"
import type { SecurityNotificationV1Type } from "../../../client/types/SecurityNotificationV1Type.js"
import { footerV1SchemaFields } from "./parts/footerV1SchemaFields.js"

const stringSchema200 = a.pipe(a.string(), a.trim(), a.nonEmpty(), a.maxLength(200))
const stringSchema1000 = a.pipe(a.string(), a.trim(), a.nonEmpty(), a.maxLength(1000))

export const securityNotificationV1Schema = a.pipe(
  a.object({
    l: a.fallback(languageSchema, language.en),
    event: a.picklist([
      "emailOtpRequested",
      "emailOtpVerified",
      "emailOtpFailed",
      "impersonationStarted",
      "impersonationEnded",
    ]),
    subject: stringSchema200,
    preview: a.optional(stringSchema200),
    heading: a.optional(stringSchema200),
    greeting: a.optional(stringSchema200),
    message: stringSchema1000,
    details: a.optional(a.pipe(a.array(a.object({ label: stringSchema200, value: stringSchema200 })), a.maxLength(8))),
    ...footerV1SchemaFields,
  }),
  a.metadata({
    title: "Security Notification Email",
    description: "Styled transactional email for security and impersonation activity",
  }),
)

type SecurityNotificationV1SchemaType = a.InferOutput<typeof securityNotificationV1Schema>

function types1(d: SecurityNotificationV1SchemaType): SecurityNotificationV1Type {
  return { ...d }
}
