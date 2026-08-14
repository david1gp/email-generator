import { Body, Container, Html, Preview, pixelBasedPreset, Tailwind } from "@react-email/components"
import type { Language } from "../../client/i18n/language.js"
import type { FooterV1Type } from "../../client/types/FooterV1Type.js"
import { classArr } from "../utils/classArr.js"
import Footer from "./Footer.js"
import { MsoGhostTable } from "./MsoGhostTable.js"
import { outlookFontStack } from "./outlookFontStack.js"
import { outlookSafeHeadHtml } from "./outlookSafeHeadHtml.js"

export interface EmailLayoutProps extends FooterV1Type {
  l?: Language
  preview: string
  children: React.ReactNode
}

/**
 * Office and VML namespaces must be bound on the root <html> element, otherwise
 * the `<o:OfficeDocumentSettings>` block in <head> (and any future VML markup)
 * is not recognised by classic Outlook. `Html` forwards unknown props to the
 * element, but its prop type omits namespaced attributes, hence the cast.
 */
const outlookNamespaceProps = {
  xmlns: "http://www.w3.org/1999/xhtml",
  "xmlns:o": "urn:schemas-microsoft-com:office:office",
  "xmlns:v": "urn:schemas-microsoft-com:vml",
} as Record<string, string>

export function EmailLayout(p: EmailLayoutProps) {
  return (
    <Html {...outlookNamespaceProps}>
      {/* Raw <head>: conditional comments cannot be expressed as JSX elements.
          It sits outside <Tailwind>, which therefore never needs to clone it. */}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, non-user Outlook markup */}
      <head dangerouslySetInnerHTML={{ __html: outlookSafeHeadHtml }} />
      <Preview>{p.preview}</Preview>
      {/* pixelBasedPreset emits px instead of rem, which classic Outlook cannot resolve */}
      <Tailwind config={pixelBasedPreset}>
        <Body className={"bg-gray-50 my-auto px-2"} style={{ fontFamily: outlookFontStack }}>
          {/* Ghost table: classic Outlook gets the fixed 600px width and the
              inner padding structurally; modern clients keep max-width + p-4 */}
          <MsoGhostTable padding={"16px"} backgroundColor={"#ffffff"}>
            <Container
              className={classArr(
                "max-w-[600px]",
                "bg-white",
                "mt-10 mb-0 p-4",
                // px radius: the pixel preset does not cover border-radius, and classic Outlook cannot resolve rem
                "border border-solid border-[#eaeaea] rounded-[12px]",
              )}
            >
              {p.children}
            </Container>
          </MsoGhostTable>

          <MsoGhostTable padding={"0 16px 8px"}>
            <Footer
              homepageText={p.homepageText}
              homepageUrl={p.homepageUrl}
              hompageSubtitle={p.hompageSubtitle}
              legalCompanySignature={p.legalCompanySignature}
            />
          </MsoGhostTable>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default EmailLayout
