import InvoiceV1Template from "./InvoiceV1Template.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import type { InvoiceV1Type } from "../../../client/types/InvoiceV1Type.js"

/** Preview variant: unpaid invoice with a payment link. Renders the shared base template. */
export function InvoiceV1UnpaidWithLink(p: InvoiceV1Type) {
  return <InvoiceV1Template {...p} />
}

InvoiceV1UnpaidWithLink.PreviewProps = {
  l: "en",
  isPaid: false,
  url: "https://example.com/invoices/INV-1024/pay",
  customerId: "CUS-5567",
  invoiceId: "INV-1024",
  amount: "$149.00",
  ...footerV1ExampleData,
} as InvoiceV1Type

export default InvoiceV1UnpaidWithLink
