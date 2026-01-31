import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"
import { language } from "~/i18n/language"
import { languageSchema } from "~/i18n/languageSchema"
import type { PasswordChangeV1Type } from "~/types/PasswordChangeV1Type"

export const passwordChangeV1Schema = v.pipe(
  v.object({
    ...languageSchemaFields,
    l: v.fallback(languageSchema, language.en),
    userName: v.optional(v.pipe(stringSchema, v.description("Name of the user requesting password change"))),
    code: v.pipe(stringSchema, v.description("Verification code for password reset")),
    url: v.pipe(stringSchema500, v.description("URL to reset the password")),
    expiryMinutes: v.optional(v.pipe(v.number(), v.description("Minutes until the reset code expires"))),
    supportUrl: v.optional(v.pipe(stringSchema500, v.description("URL to get help with password reset"))),
    ...footerV1SchemaFields,
  }),
  v.metadata({
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

type PasswordChangeV1SchemaType = v.InferOutput<typeof passwordChangeV1Schema>

function types1(d: PasswordChangeV1SchemaType): PasswordChangeV1Type {
  return { ...d }
}
