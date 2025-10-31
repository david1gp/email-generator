import type { TranslationBlock } from "@/i18n/TranslationBlock"
import { tt0, tt1, tt2 } from "@/i18n/tt0"
import { t4orgInvitation } from "@/templates/org_invitation/t4orgInvitation"
import Footer from "@/templates/parts/Footer"
import { footerV1ExampleData } from "@/templates/parts/footerV1ExampleData"
import { LinkButton } from "@/templates/parts/LinkButton"
import { tbCopyAndPasteThisUrl } from "@/templates/parts/tbCopyAndPasteThisUrl"
import { classArr } from "@/utils/classArr"
import { Body, Container, Head, Heading, Html, Link, Preview, Section, Tailwind, Text } from "@react-email/components"
import { language } from "~/i18n/language"
import type { OrgInvitationV1Type } from "~/types/OrgInvitationV1Type"

export function RegisterEmailV1Template(p: OrgInvitationV1Type) {
  const l = p.l ?? language.en
  const tt = t4orgInvitation

  function t0(tb: TranslationBlock) {
    return tt0(l, tb)
  }

  function t1(tb: TranslationBlock, x1: string) {
    return tt1(l, tb, x1)
  }

  function t2(tb: TranslationBlock, x1: string, x2: string) {
    return tt2(l, tb, x1, x2)
  }

  const title = t2(tt.Join_x2, p.invitedByName, p.orgName)
  const hi = t1(tt.Hi_x, p.invitedName)

  const buttonText = t0(tt.Join_organization)

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
            <Heading className="text-2xl font-normal mb-0">
              {t0(tt.Join_x2_p1)} <strong>{p.orgName}</strong> {t0(tt.Join_x2_p2)} <strong>{p.homepageText}</strong>
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
              {t0(tt.has_invited_you)} <strong>{p.orgName}</strong> {t0(tt.organization_in)}{" "}
              <strong>{p.homepageText}</strong>.
            </Text>

            <Section className={"mt-2"}>
              <LinkButton url={p.url} text={buttonText} />
            </Section>

            <Text className="mt-4 mb-1 text-lg">{t0(tbCopyAndPasteThisUrl)} </Text>
            <Link href={p.url} className="text-blue-600 no-underline text-lg">
              {p.url}
            </Link>
          </Container>

          <Footer homepageText={p.homepageText} homepageUrl={p.homepageUrl} hompageSubtitle={p.hompageSubtitle} />
        </Body>
      </Tailwind>
    </Html>
  )
}

RegisterEmailV1Template.PreviewProps = {
  l: "en",
  // data
  invitedName: "Bob",
  invitedByName: "Alice",
  invitedByEmail: "Alice@example.com",
  orgName: "Alice Inc",
  url: "https://example.com/sign-in?code=ABC123",
  // footer
  ...footerV1ExampleData,
} as OrgInvitationV1Type

export default RegisterEmailV1Template
