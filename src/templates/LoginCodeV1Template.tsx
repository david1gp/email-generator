import { tt0, tt1 } from "@/i18n/tt0"
import { CodeBlock } from "@/templates/parts/CodeBlock"
import Footer from "@/templates/parts/Footer"
import { LinkButton } from "@/templates/parts/LinkButton"
import { t4emailSignIn } from "@/templates/t4emailSignIn"
import { Body, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components"
import { language } from "~/i18n/language"
import type { LoginCodeV1Type } from "~/LoginCodeV1Type"

export function LoginCodeV1Template(p: LoginCodeV1Type) {
  const l = p.l ?? language.en
  const title = tt1(l, t4emailSignIn.Sign_in_title_x, p.code)

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Tailwind>
        <Body className={"bg-gray-50 my-auto mx-auto font-sans px-2"}>
          <Container
            className={"border border-solid border-[#eaeaea] rounded my-10 mb-0 mx-auto p-4 max-w-[600px] bg-white"}
          >
            <Heading className={"text-2xl font-semibold"}>{title}</Heading>
            <Text>{tt0(l, t4emailSignIn.Sign_in_instructions)}</Text>
            <Section className={"w-full"}>
              <CodeBlock className={"px-2"} text={p.code} />
            </Section>
            <Section className={"pt-4"}>
              <LinkButton url={p.url} text={tt0(l, t4emailSignIn.Sign_in_link)} />
            </Section>
          </Container>
          <Container className={"mx-auto pb-2 px-4 max-w-[600px]"}>
            <Footer homepageText={p.homepageText} homepageUrl={p.homepageUrl} mottoText={p.mottoText} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

LoginCodeV1Template.PreviewProps = {
  l: "en",
  url: "https://sign-in.com",
  code: `ABC-123`,
  homepageText: "https://example.com",
  homepageUrl: "https://example.com",
  mottoText: "Excellency by design",
} as LoginCodeV1Type

export default LoginCodeV1Template
