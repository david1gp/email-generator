import { Body, Container, Head, Heading, Html, Link, Preview, Section, Tailwind, Text } from "@react-email/components"
import { language } from "../../../client/i18n/language.js"
import type { TeamInvitationV1Type } from "../../../client/types/TeamInvitationV1Type.js"
import type { TranslationBlock } from "../../i18n/TranslationBlock.js"
import { tt0, tt1, tt2 } from "../../i18n/tt0.js"
import Footer from "../../template_parts/Footer.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import { LinkButton } from "../../template_parts/LinkButton.js"
import { tbCopyAndPasteThisUrl } from "../../template_parts/tbCopyAndPasteThisUrl.js"
import { classArr } from "../../utils/classArr.js"
import { t4teamInvitation } from "./t4teamInvitation.js"

export function TeamInvitationV1Template(p: TeamInvitationV1Type) {
  const l = p.l ?? language.en
  const tt = t4teamInvitation

  function t0(tb: TranslationBlock) {
    return tt0(l, tb)
  }

  function t1(tb: TranslationBlock, x1: string) {
    return tt1(l, tb, x1)
  }

  function t2(tb: TranslationBlock, x1: string, x2: string) {
    return tt2(l, tb, x1, x2)
  }

  const title = t2(tt.Join_x2, p.invitedByName, p.teamName)
  const hi = t1(tt.Hi_x, p.invitedName)

  const buttonText = t0(tt.Join_team)

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
              {t0(tt.Join_x2_p1)} <strong>{p.teamName}</strong> {t0(tt.Join_x2_p2)} <strong>{p.homepageText}</strong>
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
              {t0(tt.has_invited_you)} <strong>{p.teamName}</strong> {t0(tt.team_in)}{" "}
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

TeamInvitationV1Template.PreviewProps = {
  l: "en",
  invitedName: "Bob",
  invitedByName: "Alice",
  invitedByEmail: "Alice@example.com",
  teamName: "Engineering",
  url: "https://example.com/sign-in?code=ABC123",
  ...footerV1ExampleData,
} as TeamInvitationV1Type

export default TeamInvitationV1Template
