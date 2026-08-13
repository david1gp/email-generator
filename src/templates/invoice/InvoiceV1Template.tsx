import { Column, Heading, Link, Row, Section, Text } from "@react-email/components"
import { language } from "../../../client/i18n/language.js"
import type { InvoiceV1Type } from "../../../client/types/InvoiceV1Type.js"
import type { TranslationBlock } from "../../i18n/TranslationBlock.js"
import { tt0, tt1 } from "../../i18n/tt0.js"
import { EmailLayout } from "../../template_parts/EmailLayout.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import { LinkButton } from "../../template_parts/LinkButton.js"
import { tbCopyAndPasteThisUrl } from "../../template_parts/tbCopyAndPasteThisUrl.js"
import { classArr } from "../../utils/classArr.js"
import { t4invoice } from "./t4invoice.js"

export function InvoiceV1Template(p: InvoiceV1Type) {
  const l = p.l ?? language.en
  const tt = t4invoice

  function t0(tb: TranslationBlock) {
    return tt0(l, tb)
  }

  function t1(tb: TranslationBlock, x1: string) {
    return tt1(l, tb, x1)
  }

  const title =
    p.subject ??
    (p.isPaid
      ? p.invoiceId
        ? t1(tt.Invoice_x_paid, p.invoiceId)
        : t0(tt.Payment_received)
      : p.invoiceId
        ? t1(tt.Invoice_x_due, p.invoiceId)
        : t0(tt.Payment_due))

  const intro = p.intro ?? (p.isPaid ? t0(tt.Thank_you_for_payment) : t0(tt.Please_find_invoice_details))
  const buttonText = p.buttonText ?? (p.isPaid ? t0(tt.View_invoice) : t0(tt.Pay_invoice))
  const invoiceAttachedText = p.invoiceAttachedText ?? t0(tt.Invoice_attached)
  const copyAndPasteUrlText = p.copyAndPasteUrlText ?? t0(tbCopyAndPasteThisUrl)

  const details: { label: string; value: string }[] = []
  if (p.invoiceId) details.push({ label: p.invoiceIdLabel ?? t0(tt.Invoice_id), value: p.invoiceId })
  if (p.customerId) details.push({ label: p.customerIdLabel ?? t0(tt.Customer_id), value: p.customerId })
  if (p.amount) details.push({ label: p.amountLabel ?? t0(tt.Amount), value: p.amount })
  if (p.details) details.push(...p.details)

  const sectionClass = "mt-1"
  const sectionTextClass = "mb-1 text-lg"

  return (
    <EmailLayout
      l={l}
      preview={title}
      homepageText={p.homepageText}
      homepageUrl={p.homepageUrl}
      hompageSubtitle={p.hompageSubtitle}
    >
      <Heading className={"text-2xl font-semibold mb-0"}>{title}</Heading>

      <Section className={""}>
        <Text className={sectionTextClass}>{intro}</Text>
      </Section>

      {details.length > 0 && (
        <Section className={classArr("mt-2 p-3", "bg-gray-50", "border border-solid border-[#eaeaea] rounded-[8px]")}>
          {details.map((d, i) => (
            <Row key={`${i}-${d.label}`} className={"mb-1"}>
              <Column className={"text-gray-600 text-lg"}>{d.label}</Column>
              <Column className={"text-right font-semibold text-lg"}>{d.value}</Column>
            </Row>
          ))}
        </Section>
      )}

      {p.url ? (
        <>
          <Section className={"mt-3"}>
            <LinkButton url={p.url} text={buttonText} />
          </Section>

          <Section className={sectionClass}>
            <Text className={sectionTextClass}>{copyAndPasteUrlText} </Text>
            <Link href={p.url} className="text-blue-600 no-underline text-lg">
              {p.url}
            </Link>
          </Section>
        </>
      ) : (
        <Section className={"mt-3"}>
          <Text className={sectionTextClass}>{invoiceAttachedText}</Text>
        </Section>
      )}
    </EmailLayout>
  )
}

InvoiceV1Template.PreviewProps = {
  l: "en",
  // data
  isPaid: true,
  url: "https://example.com/invoices/INV-1024",
  customerId: "CUS-5567",
  invoiceId: "INV-1024",
  amount: "$149.00",
  // footer
  ...footerV1ExampleData,
} as InvoiceV1Type

export default InvoiceV1Template
