import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"
import { language } from "~/i18n/language"
import { languageSchema } from "~/i18n/languageSchema"
import type { EmailChangeV1Type } from "~/types/EmailChangeV1Type"

export const emailChangeV1Schema = v.pipe(
  v.object({
    ...languageSchemaFields,
    l: v.fallback(languageSchema, language.en),
    userName: v.optional(v.pipe(stringSchema, v.description("Name of the user changing their email"))),
    code: v.pipe(stringSchema, v.description("Verification code for email change")),
    url: v.pipe(stringSchema500, v.description("URL to confirm the email change")),
    expiryMinutes: v.optional(v.pipe(v.number(), v.description("Minutes until the verification code expires"))),
    supportUrl: v.optional(v.pipe(stringSchema500, v.description("URL to get help with email change"))),
    ...footerV1SchemaFields,
  }),
  v.metadata({
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

type EmailChangeV1SchemaType = v.InferOutput<typeof emailChangeV1Schema>

function types1(d: EmailChangeV1SchemaType): EmailChangeV1Type {
  return { ...d }
}
