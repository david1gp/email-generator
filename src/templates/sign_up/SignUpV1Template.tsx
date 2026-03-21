import type { TranslationBlock } from "../../i18n/TranslationBlock.js"
import { tt0, tt1 } from "../../i18n/tt0.js"
import { CodeBlock } from "../../template_parts/CodeBlock.js"
import Footer from "../../template_parts/Footer.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"
import { LinkButton } from "../../template_parts/LinkButton.js"
import { tbCopyAndPasteThisUrl } from "../../template_parts/tbCopyAndPasteThisUrl.js"
import { t4signUp } from "./t4signUp.js"
import { classArr } from "../../utils/classArr.js"
import { Body, Container, Head, Heading, Html, Link, Preview, Section, Tailwind, Text } from "@react-email/components"
import { language } from "../../../client/i18n/language.js"
import type { SignUpV1Type } from "../../../client/types/SignUpV1Type.js"
import { tbOrUseTheMagicLinkBelow } from "../../template_parts/tbOrUseTheMagicLinkBelow.js"

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
