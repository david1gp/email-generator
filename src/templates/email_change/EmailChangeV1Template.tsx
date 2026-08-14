import { Heading, Link, Section, Text } from "@react-email/components"
import { language } from "../../../client/i18n/language.js"
import type { EmailChangeV1Type } from "../../../client/types/EmailChangeV1Type.js"
import type { TranslationBlock } from "../../i18n/TranslationBlock.js"
import { tt0, tt1 } from "../../i18n/tt0.js"
import { CodeBlock } from "../../template_parts/CodeBlock.js"
import { EmailLayout } from "../../template_parts/EmailLayout.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import { LinkButton } from "../../template_parts/LinkButton.js"
import { tbCopyAndPasteThisUrl } from "../../template_parts/tbCopyAndPasteThisUrl.js"
import { tbOrUseTheMagicLinkBelow } from "../../template_parts/tbOrUseTheMagicLinkBelow.js"
import { t4emailChange } from "./t4emailChange.js"

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

  const title = p.subject ?? t1(tt.Email_change_verification_code_x, p.code)
  const greeting = p.greeting ?? (p.userName ? t1(tt.Hi_name, p.userName) : t0(tt.Hello))
  const codeLabel = p.codeLabel ?? t0(tt.Your_one_time_verification_code_is)
  const magicLinkText = p.magicLinkText ?? t0(tbOrUseTheMagicLinkBelow)
  const buttonText = p.buttonText ?? t0(tt.Email_change_link)
  const copyAndPasteUrlText = p.copyAndPasteUrlText ?? t0(tbCopyAndPasteThisUrl)
  const expiryText = p.expiryText ?? t1(tt.This_code_expires_in_x_minutes, expiryMinutes.toString())
  const ignoreText = p.ignoreText ?? t0(tt.If_you_didnt_request_this_change)
  const contactSupportText = p.contactSupportText ?? t0(tt.Contact_support)

  const sectionClass = "mt-1"
  const sectionTextClass = "mb-1 text-lg"

  return (
    <EmailLayout
      l={l}
      preview={title}
      homepageText={p.homepageText}
      homepageUrl={p.homepageUrl}
      hompageSubtitle={p.hompageSubtitle}
      legalCompanySignature={p.legalCompanySignature}
    >
      <Heading className={"text-2xl font-semibold mb-0"}>{title}</Heading>

      <Section className={""}>
        <Text className={sectionTextClass}>{greeting}</Text>
      </Section>

      <Section className={""}>
        {p.requestText ? (
          <Text className={sectionTextClass}>{p.requestText}</Text>
        ) : (
          <Text className={sectionTextClass}>
            {t0(tt.You_requested_to_change_email_address_associated_with_your_account_in)}{" "}
            <span className="text-blue-600 font-semibold">{p.homepageText}</span>.
          </Text>
        )}
      </Section>

      <Section className={""}>
        <Text className={sectionTextClass}>{codeLabel}</Text>
        <CodeBlock className={"px-2"} text={p.code} />
      </Section>

      <Section className={sectionClass}>
        <Text className={sectionTextClass}>{magicLinkText} </Text>
        <LinkButton url={p.url} text={buttonText} />
      </Section>

      <Section className={sectionClass}>
        <Text className={sectionTextClass}>{copyAndPasteUrlText} </Text>
        <Link href={p.url} className="text-blue-600 no-underline text-lg">
          {p.url}
        </Link>
      </Section>

      <Section className={sectionClass}>
        <Text className={"text-sm text-gray-600"}>{expiryText}</Text>
        <Text className={"text-sm text-gray-600"}>
          {ignoreText}{" "}
          {p.supportUrl ? (
            <Link href={p.supportUrl} className="text-blue-600 no-underline">
              {contactSupportText}
            </Link>
          ) : (
            contactSupportText
          )}
          {"."}
        </Text>
      </Section>
    </EmailLayout>
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
