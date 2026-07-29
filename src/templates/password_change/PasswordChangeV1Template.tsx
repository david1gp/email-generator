import { Heading, Link, Section, Text } from "@react-email/components"
import { language } from "../../../client/i18n/language.js"
import type { PasswordChangeV1Type } from "../../../client/types/PasswordChangeV1Type.js"
import type { TranslationBlock } from "../../i18n/TranslationBlock.js"
import { tt0, tt1 } from "../../i18n/tt0.js"
import { CodeBlock } from "../../template_parts/CodeBlock.js"
import { EmailLayout } from "../../template_parts/EmailLayout.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import { LinkButton } from "../../template_parts/LinkButton.js"
import { tbCopyAndPasteThisUrl } from "../../template_parts/tbCopyAndPasteThisUrl.js"
import { tbOrUseTheMagicLinkBelow } from "../../template_parts/tbOrUseTheMagicLinkBelow.js"
import { t4passwordChange } from "./t4passwordChange.js"

export function PasswordChangeV1Template(p: PasswordChangeV1Type) {
  const l = p.l ?? language.en
  const tt = t4passwordChange

  function t0(tb: TranslationBlock) {
    return tt0(l, tb)
  }

  function t1(tb: TranslationBlock, x1: string) {
    return tt1(l, tb, x1)
  }

  const expiryMinutes = p.expiryMinutes ?? 10

  const title = t1(tt.Password_change_code_x, p.code)

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
        <Text className={sectionTextClass}>
          {p.userName ? t1(tt.Hi_name, p.userName) : t0(tt.Hello)}
          <br />
          {t0(tt.You_requested_to_change_or_reset_your_password_on)}{" "}
          <span className="text-blue-600 font-semibold">{p.homepageText}</span>.
        </Text>
      </Section>

      <Section className={""}>
        <Text className={sectionTextClass}>{t0(tt.Your_password_change_code_is)}</Text>
        <CodeBlock className={"px-2"} text={p.code} />
      </Section>

      <Section className={sectionClass}>
        <Text className={sectionTextClass}>{t0(tbOrUseTheMagicLinkBelow)} </Text>
        <LinkButton url={p.url} text={t0(tt.Password_change_link)} />
      </Section>

      <Section className={sectionClass}>
        <Text className={sectionTextClass}>{t0(tbCopyAndPasteThisUrl)} </Text>
        <Link href={p.url} className="text-blue-600 no-underline text-lg">
          {p.url}
        </Link>
      </Section>

      <Section className={sectionClass}>
        <Text className={"text-gray-600"}>{t1(tt.This_code_expires_in_x_minutes, expiryMinutes.toString())}</Text>
        <Text className={"text-gray-600"}>
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
    </EmailLayout>
  )
}

PasswordChangeV1Template.PreviewProps = {
  l: "en",
  // data
  userName: "Bob",
  code: "483920",
  url: "https://example.com/reset-password?code=483920",
  expiryMinutes: 10,
  supportUrl: "mailto:example@example.com",
  // footer
  ...footerV1ExampleData,
} as PasswordChangeV1Type

export default PasswordChangeV1Template
