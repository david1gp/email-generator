import * as a from "valibot"
import type { SignUpV1Type } from "../../../client/types/SignUpV1Type.js"
import { footerV1SchemaFields } from "./parts/footerV1SchemaFields.js"
import { languageSchemaFields } from "./parts/languageSchemaFields.js"
import { overrideStringSchema } from "./parts/overrideStringSchema.js"
import { stringSchema, stringSchema500 } from "./parts/stringSchema.js"

export const signUpV1Schema = a.pipe(
  a.object({
    ...languageSchemaFields,
    code: a.pipe(stringSchema, a.description("Verification code for email confirmation")),
    url: a.pipe(stringSchema500, a.description("URL to complete the sign up process")),
    subject: overrideStringSchema,
    codeLabel: overrideStringSchema,
    magicLinkText: overrideStringSchema,
    buttonText: overrideStringSchema,
    copyAndPasteUrlText: overrideStringSchema,
    ...footerV1SchemaFields,
  }),
  a.metadata({
    title: "Sign Up Email",
    description: "Email template for user registration with verification code",
    examples: [
      {
        l: "en",
        code: "123456",
        url: "https://example.com/verify?code=123456",
        homepageText: "Welcome",
        homepageUrl: "https://example.com",
        hompageSubtitle: "Verify your email",
        companyName: "Example Corp",
        companyAddress: "123 Main St, City, Country",
        supportEmail: "support@example.com",
        privacyPolicyUrl: "https://example.com/privacy",
        termsOfServiceUrl: "https://example.com/terms",
      },
    ],
  }),
)

type SignUpV1SchemaType = a.InferOutput<typeof signUpV1Schema>

function types1(d: SignUpV1SchemaType): SignUpV1Type {
  return { ...d }
}
