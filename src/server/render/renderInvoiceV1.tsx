import { tt0, tt1 } from "../../i18n/tt0.js"
import InvoiceV1Template from "../../templates/invoice/InvoiceV1Template.js"
import { t4invoice } from "../../templates/invoice/t4invoice.js"
import { render } from "@react-email/render"
import { language } from "../../../client/i18n/language.js"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType.js"
import type { InvoiceV1Type } from "../../../client/types/InvoiceV1Type.js"

export async function renderInvoiceV1(p: InvoiceV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = p.isPaid
    ? p.invoiceId
      ? tt1(l, t4invoice.Invoice_x_paid, p.invoiceId)
      : tt0(l, t4invoice.Payment_received)
    : p.invoiceId
      ? tt1(l, t4invoice.Invoice_x_due, p.invoiceId)
      : tt0(l, t4invoice.Payment_due)
  return {
    subject,
    text: await render(<InvoiceV1Template {...p} />, { plainText: true }),
    html: await render(<InvoiceV1Template {...p} />),
  }
}
