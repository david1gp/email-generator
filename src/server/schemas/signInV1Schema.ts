import { footerV1SchemaFields } from "@/server/schemas/parts/footerV1SchemaFields"
import { languageSchemaFields } from "@/server/schemas/parts/languageSchemaFields"
import { stringSchema, stringSchema500 } from "@/server/schemas/parts/stringSchema"
import * as v from "valibot"
import { language } from "~/i18n/language"
import { languageSchema } from "~/i18n/languageSchema"
import type { SignInV1Type } from "~/types/SignInV1Type"

export const signInV1Schema = v.pipe(
  v.object({
    ...languageSchemaFields,
    l: v.fallback(languageSchema, language.en),
    code: v.pipe(stringSchema, v.description("One-time login verification code")),
    url: v.pipe(stringSchema500, v.description("URL to enter the verification code")),
    ...footerV1SchemaFields,
  }),
  v.metadata({
    title: "Sign In Email",
    description: "Email template for user sign-in with one-time verification code",
    examples: [
      {
        l: "en",
        code: "123456",
        url: "https://example.com/verify?code=123456",
        homepageText: "Sign In",
        homepageUrl: "https://example.com",
        hompageSubtitle: "Use this code to sign in",
        companyName: "Example Corp",
        companyAddress: "123 Main St, City, Country",
        supportEmail: "support@example.com",
        privacyPolicyUrl: "https://example.com/privacy",
        termsOfServiceUrl: "https://example.com/terms",
      },
    ],
  }),
)

type SignInV1SchemaType = v.InferOutput<typeof signInV1Schema>

function types1(d: SignInV1SchemaType): SignInV1Type {
  return { ...d }
}
