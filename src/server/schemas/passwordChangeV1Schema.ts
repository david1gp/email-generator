import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import { language } from "@client/i18n/language"
import { languageSchema } from "@client/i18n/languageSchema"
import type { PasswordChangeV1Type } from "@client/types/PasswordChangeV1Type"
import * as a from "valibot"

export const passwordChangeV1Schema = a.pipe(
  a.object({
    ...languageSchemaFields,
    l: a.fallback(languageSchema, language.en),
    userName: a.optional(a.pipe(stringSchema, a.description("Name of the user requesting password change"))),
    code: a.pipe(stringSchema, a.description("Verification code for password reset")),
    url: a.pipe(stringSchema500, a.description("URL to reset the password")),
    expiryMinutes: a.optional(a.pipe(a.number(), a.description("Minutes until the reset code expires"))),
    supportUrl: a.optional(a.pipe(stringSchema500, a.description("URL to get help with password reset"))),
    ...footerV1SchemaFields,
  }),
  a.metadata({
    title: "Password Change Email",
    description: "Email template for password reset requests",
    examples: [
      {
        l: "en",
        userName: "John Doe",
        code: "123456",
        url: "https://example.com/reset-password?code=123456",
        expiryMinutes: 30,
        supportUrl: "https://example.com/help",
        homepageText: "Reset Password",
        homepageUrl: "https://example.com",
        hompageSubtitle: "Click below to reset your password",
        companyName: "Example Corp",
        companyAddress: "123 Main St, City, Country",
        supportEmail: "support@example.com",
        privacyPolicyUrl: "https://example.com/privacy",
        termsOfServiceUrl: "https://example.com/terms",
      },
    ],
  }),
)

type PasswordChangeV1SchemaType = a.InferOutput<typeof passwordChangeV1Schema>

function types1(d: PasswordChangeV1SchemaType): PasswordChangeV1Type {
  return { ...d }
}
