import { footerV1SchemaFields } from "./parts/footerV1SchemaFields.js"
import { languageSchemaFields } from "./parts/languageSchemaFields.js"
import { stringSchema, stringSchema500 } from "./parts/stringSchema.js"
import { language } from "../../../client/i18n/language.js"
import { languageSchema } from "../../../client/i18n/languageSchema.js"
import type { InvoiceV1Type } from "../../../client/types/InvoiceV1Type.js"
import * as a from "valibot"

export const invoiceV1Schema = a.pipe(
  a.object({
    ...languageSchemaFields,
    l: a.fallback(languageSchema, language.en),
    isPaid: a.pipe(
      a.boolean(),
      a.description("Whether the invoice has been paid (true → receipt, false → payment due)"),
    ),
    url: a.optional(
      a.pipe(
        stringSchema500,
        a.description("URL to pay or view the invoice; when omitted the email refers to the attached invoice"),
      ),
    ),
    customerId: a.optional(a.pipe(stringSchema, a.description("Customer identifier"))),
    invoiceId: a.optional(a.pipe(stringSchema, a.description("Invoice identifier"))),
    amount: a.optional(a.pipe(stringSchema, a.description("Formatted invoice amount, e.g. $149.00"))),
    ...footerV1SchemaFields,
  }),
  a.metadata({
    title: "Invoice Email",
    description: "Email template for sending an invoice, with paid and unpaid variants",
    examples: [
      {
        l: "en",
        isPaid: true,
        url: "https://example.com/invoices/INV-1024",
        customerId: "CUS-5567",
        invoiceId: "INV-1024",
        amount: "$149.00",
        homepageText: "Example Corp",
        homepageUrl: "https://example.com",
        hompageSubtitle: "Excellency by design",
      },
    ],
  }),
)

type InvoiceV1SchemaType = a.InferOutput<typeof invoiceV1Schema>

function types1(d: InvoiceV1SchemaType): InvoiceV1Type {
  return { ...d }
}
