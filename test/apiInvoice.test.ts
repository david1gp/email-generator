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
}

const name = "apiInvoice"
if (process.env.CI) {
  test.skip(name, testFn)
} else {
  test(name, testFn)
}
