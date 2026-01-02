import type { TranslationBlock } from "@/i18n/TranslationBlock"
import { tt0, tt1 } from "@/i18n/tt0"
import { CodeBlock } from "@/template_parts/CodeBlock"
import Footer from "@/template_parts/Footer"
import { footerV1ExampleData } from "@/template_parts/footerV1ExampleData"
import { LinkButton } from "@/template_parts/LinkButton"
import { tbCopyAndPasteThisUrl } from "@/template_parts/tbCopyAndPasteThisUrl"
import { tbOrUseTheMagicLinkBelow } from "@/template_parts/tbOrUseTheMagicLinkBelow"
import { t4emailChange } from "@/templates/email_change/t4emailChange"
import { classArr } from "@/utils/classArr"
import { Body, Container, Head, Heading, Html, Link, Preview, Section, Tailwind, Text } from "@react-email/components"
import { language } from "~/i18n/language"
import type { EmailChangeV1Type } from "~/types/EmailChangeV1Type"

export function EmailChangeV1Template(p: EmailChangeV1Type) {
  const l = p.l ?? language.en
  const tt = t4emailChange

  function t0(tb: TranslationBlock) {
    return tt0(l, tb)
  }

  function t1(tb: TranslationBlock, x1: string) {
    return tt1(l, tb, x1)
  }

  const expiryMinutes = p.expiryMinutes ?? 10

  const title = t1(tt.Email_change_verification_code_x, p.code)

  const sectionClass = "mt-1"
  const sectionTextClass = "mb-1 text-lg"

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
              <Text className={sectionTextClass}>
                {p.userName ? <>{t1(tt.Hi_name, p.userName)}</> : <>{t0(tt.Hello)}</>}
              </Text>
            </Section>

            <Section className={""}>
              <Text className={sectionTextClass}>
                {t0(tt.You_requested_to_change_email_address_associated_with_your_account_in)}{" "}
                <span className="text-blue-600 font-semibold">{p.homepageText}</span>.
              </Text>
            </Section>

            <Section className={""}>
              <Text className={sectionTextClass}>{t0(tt.Your_one_time_verification_code_is)}</Text>
              <CodeBlock className={"px-2"} text={p.code} />
            </Section>

            <Section className={sectionClass}>
              <Text className={sectionTextClass}>{t0(tbOrUseTheMagicLinkBelow)} </Text>
              <LinkButton url={p.url} text={t0(tt.Email_change_link)} />
            </Section>

            <Section className={sectionClass}>
              <Text className={sectionTextClass}>{t0(tbCopyAndPasteThisUrl)} </Text>
              <Link href={p.url} className="text-blue-600 no-underline text-lg">
                {p.url}
              </Link>
            </Section>

            <Section className={sectionClass}>
              <Text className={"text-sm text-gray-600"}>
                {t1(tt.This_code_expires_in_x_minutes, expiryMinutes.toString())}
              </Text>
              <Text className={"text-sm text-gray-600"}>
                {t0(tt.If_you_didnt_request_this_change)}{" "}
                {p.supportUrl ? (
                  <Link href={p.supportUrl} className="text-blue-600 no-underline">
                    {t0(tt.Contact_support)}
                  </Link>
                ) : (
                  t0(tt.Contact_support)
                )}
                {"."}
              </Text>
            </Section>
          </Container>

          <Footer homepageText={p.homepageText} homepageUrl={p.homepageUrl} hompageSubtitle={p.hompageSubtitle} />
        </Body>
      </Tailwind>
    </Html>
  )
}

EmailChangeV1Template.PreviewProps = {
  l: "en",
  userName: "Bob",
  code: "729481",
  url: "https://example.com/change-email?code=729481",
  expiryMinutes: 10,
  supportUrl: "mailto:example@example.com",
  ...footerV1ExampleData,
} as EmailChangeV1Type

export default EmailChangeV1Template
