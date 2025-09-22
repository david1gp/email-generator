import { language, type Language } from "@/i18n/language"
import { tt0, tt1 } from "@/i18n/tt0"
import { CodeBlock } from "@/templates/parts/CodeBlock"
import Footer from "@/templates/parts/Footer"
import { LinkButton } from "@/templates/parts/LinkButton"
import { t4emailSignIn } from "@/templates/t4emailSignIn"
import { Body, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from "@react-email/components"

export interface LoginCodeProps {
  l?: Language
  code?: string
  url: string
  // footer
  homepageText: string
  homepageUrl: string
  mottoText: string
}

export function LoginCode(p: LoginCodeProps) {
  const l = p.l ?? language.en
  const code = p.code ?? ""
  const previewText = tt1(l, t4emailSignIn.Sign_in_preview_x, code)

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className={"bg-gray-50 my-auto mx-auto font-sans px-2"}>
          <Container
            className={"border border-solid border-[#eaeaea] rounded my-10 mb-0 mx-auto p-4 max-w-[600px] bg-white"}
          >
            <Heading className={"text-xl font-semibold"}>{previewText}</Heading>
            <Text className={"text-2xl font-bold mt-0"}>{tt0(l, t4emailSignIn.Sign_in_title)}</Text>
            <Text>{tt0(l, t4emailSignIn.Sign_in_instructions)}</Text>
            <Section className={"w-full"}>
              <CodeBlock className={"px-2"} text={code} />
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

LoginCode.PreviewProps = {
  l: "en",
  url: "https://sign-in.com",
  code: `ABC-123`,
  homepageText: "example.com",
  homepageUrl: "example.com",
  mottoText: "Excellency by design",
} as LoginCodeProps

export default LoginCode
