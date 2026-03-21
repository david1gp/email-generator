import { footerV1SchemaFields } from "./parts/footerV1SchemaFields.js"
import { languageSchemaFields } from "./parts/languageSchemaFields.js"
import { stringSchema, stringSchema500 } from "./parts/stringSchema.js"
import { language } from "../../../client/i18n/language.js"
import { languageSchema } from "../../../client/i18n/languageSchema.js"
import type { SignInV1Type } from "../../../client/types/SignInV1Type.js"
import * as a from "valibot"

export const signInV1Schema = a.pipe(
  a.object({
    ...languageSchemaFields,
    l: a.fallback(languageSchema, language.en),
    code: a.pipe(stringSchema, a.description("One-time login verification code")),
    url: a.pipe(stringSchema500, a.description("URL to enter the verification code")),
    ...footerV1SchemaFields,
  }),
  a.metadata({
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

type SignInV1SchemaType = a.InferOutput<typeof signInV1Schema>

function types1(d: SignInV1SchemaType): SignInV1Type {
  return { ...d }
}
