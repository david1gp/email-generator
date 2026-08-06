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
  /**
   * Extra detail rows rendered after the preset fields (invoiceId, customerId, amount).
   * Labels are used as-is (caller localizes); order is preserved.
   */
  details?: { label: string; value: string }[]

  /** overrides the email subject and heading (defaults to translated invoice subject) */
  subject?: string
  /** overrides the intro body paragraph */
  intro?: string
  /** overrides the CTA button text */
  buttonText?: string
  /** overrides the “invoice attached” message when `url` is omitted */
  invoiceAttachedText?: string
  /** overrides the “copy and paste this URL” instruction */
  copyAndPasteUrlText?: string
  /** overrides the Invoice ID detail label */
  invoiceIdLabel?: string
  /** overrides the Customer ID detail label */
  customerIdLabel?: string
  /** overrides the Amount detail label */
  amountLabel?: string
}
