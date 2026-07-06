import type { TranslationBlock } from "../../i18n/TranslationBlock.js"
import { tt0, tt1 } from "../../i18n/tt0.js"
import Footer from "../../template_parts/Footer.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import { LinkButton } from "../../template_parts/LinkButton.js"
import { tbCopyAndPasteThisUrl } from "../../template_parts/tbCopyAndPasteThisUrl.js"
import { t4invoice } from "./t4invoice.js"
import { classArr } from "../../utils/classArr.js"
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import { language } from "../../../client/i18n/language.js"
import type { InvoiceV1Type } from "../../../client/types/InvoiceV1Type.js"

export function InvoiceV1Template(p: InvoiceV1Type) {
  const l = p.l ?? language.en
  const tt = t4invoice

  function t0(tb: TranslationBlock) {
    return tt0(l, tb)
  }

  function t1(tb: TranslationBlock, x1: string) {
    return tt1(l, tb, x1)
  }

  const title = p.isPaid
    ? p.invoiceId
      ? t1(tt.Invoice_x_paid, p.invoiceId)
      : t0(tt.Payment_received)
    : p.invoiceId
      ? t1(tt.Invoice_x_due, p.invoiceId)
      : t0(tt.Payment_due)

  const intro = p.isPaid ? t0(tt.Thank_you_for_payment) : t0(tt.Please_find_invoice_details)
  const buttonText = p.isPaid ? t0(tt.View_invoice) : t0(tt.Pay_invoice)

  const sectionClass = "mt-1"
  const sectionTextClass = "mb-1 text-lg"

  const details: { label: string; value: string }[] = []
  if (p.invoiceId) details.push({ label: t0(tt.Invoice_id), value: p.invoiceId })
  if (p.customerId) details.push({ label: t0(tt.Customer_id), value: p.customerId })
  if (p.amount) details.push({ label: t0(tt.Amount), value: p.amount })

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Tailwind>
        <Body className={"bg-gray-50 my-auto font-sans px-2"}>
          <Container
            className={classArr(
              "max-w-[600px]",
              "bg-white",
              "mt-10 mb-0 p-4",
              "border border-solid border-[#eaeaea] rounded-xl",
            )}
          >
            <Heading className={"text-2xl font-semibold mb-0"}>{title}</Heading>

            <Section className={""}>
              <Text className={sectionTextClass}>{intro}</Text>
            </Section>

            {details.length > 0 && (
              <Section
                className={classArr("mt-2 p-3", "bg-gray-50", "border border-solid border-[#eaeaea] rounded-lg")}
              >
                {details.map((d) => (
                  <Row key={d.label} className={"mb-1"}>
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
                  <Text className={sectionTextClass}>{t0(tbCopyAndPasteThisUrl)} </Text>
                  <Link href={p.url} className="text-blue-600 no-underline text-lg">
                    {p.url}
                  </Link>
                </Section>
              </>
            ) : (
              <Section className={"mt-3"}>
                <Text className={sectionTextClass}>{t0(tt.Invoice_attached)}</Text>
              </Section>
            )}
          </Container>

          <Footer homepageText={p.homepageText} homepageUrl={p.homepageUrl} hompageSubtitle={p.hompageSubtitle} />
        </Body>
      </Tailwind>
    </Html>
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
