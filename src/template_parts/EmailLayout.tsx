import { Body, Container, Head, Html, Preview, Tailwind } from "@react-email/components"
import type { Language } from "../../client/i18n/language.js"
import type { FooterV1Type } from "../../client/types/FooterV1Type.js"
import { classArr } from "../utils/classArr.js"
import Footer from "./Footer.js"

export interface EmailLayoutProps extends FooterV1Type {
  l?: Language
  preview: string
  children: React.ReactNode
}

export function EmailLayout(p: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{p.preview}</Preview>
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
            {p.children}
          </Container>

          <Footer homepageText={p.homepageText} homepageUrl={p.homepageUrl} hompageSubtitle={p.hompageSubtitle} />
        </Body>
      </Tailwind>
    </Html>
  )
}

export default EmailLayout
