import * as a from "valibot"
import { language } from "../../../client/i18n/language.js"
import { languageSchema } from "../../../client/i18n/languageSchema.js"
import type { EmailChangeV1Type } from "../../../client/types/EmailChangeV1Type.js"
import { footerV1SchemaFields } from "./parts/footerV1SchemaFields.js"
import { languageSchemaFields } from "./parts/languageSchemaFields.js"
import { stringSchema, stringSchema500 } from "./parts/stringSchema.js"

export const emailChangeV1Schema = a.pipe(
  a.object({
    ...languageSchemaFields,
    l: a.fallback(languageSchema, language.en),
    userName: a.optional(a.pipe(stringSchema, a.description("Name of the user changing their email"))),
    code: a.pipe(stringSchema, a.description("Verification code for email change")),
    url: a.pipe(stringSchema500, a.description("URL to confirm the email change")),
    expiryMinutes: a.optional(a.pipe(a.number(), a.description("Minutes until the verification code expires"))),
    supportUrl: a.optional(a.pipe(stringSchema500, a.description("URL to get help with email change"))),
    ...footerV1SchemaFields,
  }),
  a.metadata({
    title: "Email Change Email",
    description: "Email template for email change confirmation",
    examples: [
      {
        l: "en",
        userName: "John Doe",
        code: "123456",
        url: "https://example.com/confirm-email-change?code=123456",
        expiryMinutes: 30,
        supportUrl: "https://example.com/help",
        homepageText: "Confirm Email Change",
        homepageUrl: "https://example.com",
        hompageSubtitle: "Verify your new email address",
        companyName: "Example Corp",
        companyAddress: "123 Main St, City, Country",
        supportEmail: "support@example.com",
        privacyPolicyUrl: "https://example.com/privacy",
        termsOfServiceUrl: "https://example.com/terms",
      },
    ],
  }),
)

type EmailChangeV1SchemaType = a.InferOutput<typeof emailChangeV1Schema>

function types1(d: EmailChangeV1SchemaType): EmailChangeV1Type {
  return { ...d }
}
