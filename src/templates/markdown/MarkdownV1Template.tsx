import { Heading } from "@react-email/components"
import { language } from "../../../client/i18n/language.js"
import type { MarkdownV1Type } from "../../../client/types/MarkdownV1Type.js"
import { EmailLayout } from "../../template_parts/EmailLayout.js"
import { footerV1LegalExampleData } from "../../template_parts/footerV1LegalExampleData.js"
import { TrustedMarkdownContent } from "../../template_parts/TrustedMarkdownContent.js"

export function MarkdownV1Template(p: MarkdownV1Type) {
  const l = p.l ?? language.en
  const preview = p.preview ?? p.subject
  const heading = p.heading ?? p.subject

  return (
    <EmailLayout
      l={l}
      preview={preview}
      homepageText={p.homepageText}
      homepageUrl={p.homepageUrl}
      hompageSubtitle={p.hompageSubtitle}
      legalCompanySignature={p.legalCompanySignature}
    >
      <Heading
        style={{
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 0,
          lineHeight: "32px",
          color: "#000000",
        }}
      >
        {heading}
      </Heading>

      <TrustedMarkdownContent markdown={p.markdown} />
    </EmailLayout>
  )
}

/**
 * Example Markdown content fixture demonstrating all approved syntax:
 * paragraphs, bold, labeled HTTPS link, bare HTTPS URL, unordered bullet list,
 * a two-column GFM pipe-delimited table with bold/link cells,
 * and a bullet-based wide-record alternative for data with three or more fields.
 *
 * Authoring rule: tables have at most two columns with short breakable text.
 * Use bullets for records with three or more displayed fields.
 */
const exampleMarkdown = `A paragraph with **bold text** and a [labeled link](https://example.com/details).

https://example.com/status

- First item with **bold emphasis**
- Second item with a [link](https://example.com/more)
- Third item

| Plan | Status |
| --- | --- |
| Pro | **Active** |
| Team | [Pending review](https://example.com/team) |
| Free | Inactive |

- **Pro:** Active; Engineering; [Details](https://example.com/pro)
- **Team:** Pending; Sales; [Details](https://example.com/team)
- **Free:** Inactive; Support; [Details](https://example.com/free)`

MarkdownV1Template.PreviewProps = {
  l: "en",
  subject: "July update",
  preview: "Highlights and plans",
  heading: "July update",
  markdown: exampleMarkdown,
  ...footerV1LegalExampleData,
} as MarkdownV1Type

export default MarkdownV1Template
