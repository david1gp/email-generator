import { tt0, tt1 } from "@/i18n/tt0"
import { CodeBlock } from "@/templates/parts/CodeBlock"
import Footer from "@/templates/parts/Footer"
import { LinkButton } from "@/templates/parts/LinkButton"
import { t4emailSignUp } from "@/templates/t4emailSignUp"
import { Body, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components"
import { language } from "~/i18n/language"
import type { RegisterEmailV1Type } from "~/RegisterEmailV1Type"

export function RegisterEmailV1Template(p: RegisterEmailV1Type) {
  const l = p.l ?? language.en
  const previewText = tt1(l, t4emailSignUp.Sign_up_preview_x, p.code)

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className={"bg-gray-50 my-auto mx-auto font-sans px-2"}>
          <Container
            className={"border border-solid border-[#eaeaea] rounded my-10 mb-0 mx-auto p-4 max-w-[600px] bg-white"}
          >
            <Heading className={"text-2xl font-semibold"}>{previewText}</Heading>
            <Text>{tt0(l, t4emailSignUp.Sign_up_instructions)}</Text>
            <Section className={"w-full"}>
              <CodeBlock className={"px-2"} text={p.code} />
            </Section>
            <Section className={"pt-4"}>
              <LinkButton url={p.url} text={tt0(l, t4emailSignUp.Sign_up_link)} />
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

RegisterEmailV1Template.PreviewProps = {
  l: "en",
  code: `ABC-123`,
  url: "https://sign-in.com",
  homepageText: "https://example.com",
  homepageUrl: "https://example.com",
  mottoText: "Excellency by design",
} as RegisterEmailV1Type

export default RegisterEmailV1Template
