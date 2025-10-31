import type { TranslationBlock } from "@/i18n/TranslationBlock"
import { tt0, tt1 } from "@/i18n/tt0"
import { CodeBlock } from "@/templates/parts/CodeBlock"
import Footer from "@/templates/parts/Footer"
import { footerV1ExampleData } from "@/templates/parts/footerV1ExampleData"
import { LinkButton } from "@/templates/parts/LinkButton"
import { tbCopyAndPasteThisUrl } from "@/templates/parts/tbCopyAndPasteThisUrl"
import { t4signUp } from "@/templates/sign_up/t4signUp"
import { classArr } from "@/utils/classArr"
import { Body, Container, Head, Heading, Html, Link, Preview, Section, Tailwind, Text } from "@react-email/components"
import { language } from "~/i18n/language"
import type { SignUpV1Type } from "~/types/SignUpV1Type"
import { tbOrUseTheMagicLinkBelow } from "../parts/tbOrUseTheMagicLinkBelow"

export function SignUpV1Template(p: SignUpV1Type) {
  const l = p.l ?? language.en
  const tt = t4signUp

  function t0(tb: TranslationBlock) {
    return tt0(l, tb)
  }

  function t1(tb: TranslationBlock, x1: string) {
    return tt1(l, tb, x1)
  }

  const title = t1(tt.Your_signup_code_x, p.code)

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
              <Text className={sectionTextClass}>{t0(tt.Copy_and_paste_this_signup_code)}</Text>
              <CodeBlock className={"px-2"} text={p.code} />
            </Section>

            <Section className={sectionClass}>
              <Text className={sectionTextClass}>{t0(tbOrUseTheMagicLinkBelow)} </Text>
              <LinkButton url={p.url} text={t0(tt.Sign_up_link)} />
            </Section>

            <Section className={sectionClass}>
              <Text className={sectionTextClass}>{t0(tbCopyAndPasteThisUrl)} </Text>
              <Link href={p.url} className="text-blue-600 no-underline text-lg">
                {p.url}
              </Link>
            </Section>
          </Container>

          <Footer homepageText={p.homepageText} homepageUrl={p.homepageUrl} hompageSubtitle={p.hompageSubtitle} />
        </Body>
      </Tailwind>
    </Html>
  )
}

SignUpV1Template.PreviewProps = {
  l: "en",
  // data
  code: "ABC-123",
  url: "https://example.com/sign-in?code=ABC123",
  // footer
  ...footerV1ExampleData,
} as SignUpV1Type

export default SignUpV1Template
