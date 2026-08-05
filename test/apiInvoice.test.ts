import { expect, test } from "bun:test"
import { apiGenerateEmailInvoiceV1 } from "../client/apiGenerateEmailInvoiceV1.js"
import type { InvoiceV1Type } from "../client/types/InvoiceV1Type.js"
import { footerV1ExampleData } from "../src/template_parts/footerV1ExampleData.js"
import { getTargetBaseUrl, targetEnv } from "./targetEnv.js"

const unpaidProps = {
  l: "en",
  // data
  isPaid: false,
  url: "https://example.com/invoices/INV-1024/pay",
  customerId: "CUS-5567",
  invoiceId: "INV-1024",
  amount: "$149.00",
  ...footerV1ExampleData,
} as const satisfies InvoiceV1Type

const paidProps = {
  ...unpaidProps,
  isPaid: true,
  url: "https://example.com/invoices/INV-1024",
} as const satisfies InvoiceV1Type

const overrideProps = {
  ...unpaidProps,
  subject: "Dein Angebot ist bereit",
  intro: "wir haben dein individuelles Angebot vorbereitet.",
  buttonText: "Angebot ansehen",
  invoiceIdLabel: "Angebot",
  customerIdLabel: "Kunde",
  amountLabel: "Positionen",
  copyAndPasteUrlText: "oder kopiere diesen Link:",
} as const satisfies InvoiceV1Type

async function testFn() {
  const baseUrl = getTargetBaseUrl(targetEnv.readFromEnv)

  const unpaid = await apiGenerateEmailInvoiceV1(unpaidProps, baseUrl)
  if (!unpaid.success) console.error(unpaid)
  expect(unpaid.success).toBeTruthy()
  if (!unpaid.success) return
  expect(unpaid.data.html).toContain(unpaidProps.invoiceId)
  expect(unpaid.data.html).toContain(unpaidProps.amount)
  expect(unpaid.data.subject).toContain(unpaidProps.invoiceId)

  const paid = await apiGenerateEmailInvoiceV1(paidProps, baseUrl)
  if (!paid.success) console.error(paid)
  expect(paid.success).toBeTruthy()
  if (!paid.success) return
  expect(paid.data.html).toContain(paidProps.invoiceId)

  const overridden = await apiGenerateEmailInvoiceV1(overrideProps, baseUrl)
  if (!overridden.success) console.error(overridden)
  expect(overridden.success).toBeTruthy()
  if (!overridden.success) return
  expect(overridden.data.subject).toBe(overrideProps.subject)
  expect(overridden.data.html).toContain(overrideProps.intro)
  expect(overridden.data.html).toContain(overrideProps.buttonText)
  expect(overridden.data.html).toContain(overrideProps.invoiceIdLabel)
  expect(overridden.data.html).toContain(overrideProps.customerIdLabel)
  expect(overridden.data.html).toContain(overrideProps.amountLabel)
  expect(overridden.data.html).toContain(overrideProps.copyAndPasteUrlText)
}

const name = "apiInvoice"
if (process.env.CI) {
  test.skip(name, testFn)
} else {
  test(name, testFn)
}
