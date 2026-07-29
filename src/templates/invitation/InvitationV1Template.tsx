import { Heading, Link, Section, Text } from "@react-email/components"
import { language } from "../../../client/i18n/language.js"
import type { InvitationV1Type } from "../../../client/types/InvitationV1Type.js"
import type { TranslationBlock } from "../../i18n/TranslationBlock.js"
import { tt0, tt1, tt2 } from "../../i18n/tt0.js"
import { EmailLayout } from "../../template_parts/EmailLayout.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import { LinkButton } from "../../template_parts/LinkButton.js"
import { tbCopyAndPasteThisUrl } from "../../template_parts/tbCopyAndPasteThisUrl.js"
import { t4invitation } from "./t4invitation.js"

export function InvitationV1Template(p: InvitationV1Type) {
  const l = p.l ?? language.en
  const tt = t4invitation(p.entity)

  function t0(tb: TranslationBlock) {
    return tt0(l, tb)
  }

  function t1(tb: TranslationBlock, x1: string) {
    return tt1(l, tb, x1)
  }

  function t2(tb: TranslationBlock, x1: string, x2: string) {
    return tt2(l, tb, x1, x2)
  }

  const title = t2(tt.Join_x2, p.invitedByName, p.entityName)
  const hi = t1(tt.Hi_x, p.invitedName)

  const buttonText = t0(tt.Join_entity)

  return (
    <EmailLayout
      l={l}
      preview={title}
      homepageText={p.homepageText}
      homepageUrl={p.homepageUrl}
      hompageSubtitle={p.hompageSubtitle}
    >
      <Heading className="text-2xl font-normal mb-0">
        {t0(tt.Join_x2_p1)} <strong>{p.entityName}</strong> {t0(tt.Join_x2_p2)} <strong>{p.homepageText}</strong>
      </Heading>

      <Text className="text-lg">{hi}</Text>

      <Text className="text-lg">
        <strong>{p.invitedByName}</strong>
        {p.invitedByEmail && (
          <>
            <span> (</span>
            <Link href={`mailto:${p.invitedByEmail}`} className="text-blue-600 no-underline">
              {p.invitedByEmail}
            </Link>
            <span>) </span>
          </>
        )}{" "}
        {t0(tt.has_invited_you)} <strong>{p.entityName}</strong> {t0(tt.entity_in)} <strong>{p.homepageText}</strong>.
      </Text>

      <Section className={"mt-2"}>
        <LinkButton url={p.url} text={buttonText} />
      </Section>

      <Text className="mt-4 mb-1 text-lg">{t0(tbCopyAndPasteThisUrl)} </Text>
      <Link href={p.url} className="text-blue-600 no-underline text-lg">
        {p.url}
      </Link>
    </EmailLayout>
  )
}

InvitationV1Template.PreviewProps = {
  l: "en",
  invitedName: "Bob",
  invitedByName: "Alice",
  invitedByEmail: "Alice@example.com",
  // entity: "organization",
  entityName: "Alice Inc",
  url: "https://example.com/sign-in?code=ABC123",
  ...footerV1ExampleData,
} as InvitationV1Type

export default InvitationV1Template
