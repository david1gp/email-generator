import type { FooterV1Type } from "./FooterV1Type.js"
import type { MayHaveLanguageType } from "./MayHaveLanguageType.js"

export interface InvoiceV1Type extends MayHaveLanguageType, FooterV1Type {
  /** false → payment-due variant, true → payment-received variant */
  isPaid: boolean
  /** link to pay/view the invoice; when omitted the email points to the attached invoice instead */
  url?: string
  customerId?: string
  invoiceId?: string
  amount?: string
}
