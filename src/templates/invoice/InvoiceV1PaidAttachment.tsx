import type { InvoiceV1Type } from "../../../client/types/InvoiceV1Type.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import InvoiceV1Template from "./InvoiceV1Template.js"

/** Preview variant: paid invoice without a link — refers to the attached receipt. Renders the shared base template. */
export function InvoiceV1PaidAttachment(p: InvoiceV1Type) {
  return <InvoiceV1Template {...p} />
}

InvoiceV1PaidAttachment.PreviewProps = {
  l: "en",
  isPaid: true,
  customerId: "CUS-5567",
  invoiceId: "INV-1024",
  amount: "$149.00",
  ...footerV1ExampleData,
} as InvoiceV1Type

export default InvoiceV1PaidAttachment
