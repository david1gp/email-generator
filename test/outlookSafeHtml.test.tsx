import { describe, expect, test } from "bun:test"
import type { GeneratedEmailType } from "../client/types/GeneratedEmailType.js"
import { renderEmailChangeV1 } from "../src/server/render/renderEmailChangeV1.js"
import { renderInvitationV1 } from "../src/server/render/renderInvitationV1.js"
import { renderInvoiceV1 } from "../src/server/render/renderInvoiceV1.js"
import { renderMarkdownV1 } from "../src/server/render/renderMarkdownV1.js"
import { renderPasswordChangeV1 } from "../src/server/render/renderPasswordChangeV1.js"
import { renderSignInV1 } from "../src/server/render/renderSignInV1.js"
import { renderSignUpV1 } from "../src/server/render/renderSignUpV1.js"
import { footerV1ExampleData } from "../src/template_parts/footerV1ExampleData.js"

/**
 * All nine public render paths. orgInvitationV1 and teamInvitationV1 are public
 * template names served by renderInvitationV1 with a fixed `entity`.
 */
const renderAll: Record<string, () => Promise<GeneratedEmailType>> = {
  signUpV1: () =>
    renderSignUpV1({ l: "en", code: "XYZ-789", url: "https://example.com/sign-up", ...footerV1ExampleData }),
  signInV1: () =>
    renderSignInV1({ l: "en", code: "ABC-123", url: "https://example.com/sign-in", ...footerV1ExampleData }),
  invitationV1: () =>
    renderInvitationV1({
      l: "en",
      invitedName: "Bob",
      invitedByName: "Alice",
      invitedByEmail: "alice@example.com",
      entityName: "Acme Inc",
      url: "https://example.com/join",
      ...footerV1ExampleData,
    }),
  orgInvitationV1: () =>
    renderInvitationV1({
      l: "en",
      invitedName: "Bob",
      invitedByName: "Alice",
      invitedByEmail: "alice@example.com",
      entity: "organization",
      entityName: "Acme Org",
      url: "https://example.com/join-org",
      ...footerV1ExampleData,
    }),
  teamInvitationV1: () =>
    renderInvitationV1({
      l: "en",
      invitedName: "Bob",
      invitedByName: "Alice",
      invitedByEmail: "alice@example.com",
      entity: "team",
      entityName: "Acme Team",
      url: "https://example.com/join-team",
      ...footerV1ExampleData,
    }),
  passwordChangeV1: () =>
    renderPasswordChangeV1({
      l: "en",
      userName: "Bob",
      code: "483920",
      url: "https://example.com/reset",
      expiryMinutes: 10,
      ...footerV1ExampleData,
    }),
  emailChangeV1: () =>
    renderEmailChangeV1({
      l: "en",
      userName: "Bob",
      code: "729481",
      url: "https://example.com/change-email",
      expiryMinutes: 10,
      ...footerV1ExampleData,
    }),
  invoiceV1: () =>
    renderInvoiceV1({
      l: "en",
      isPaid: false,
      url: "https://example.com/invoices/INV-1024",
      customerId: "CUS-5567",
      invoiceId: "INV-1024",
      amount: "$149.00",
      ...footerV1ExampleData,
    }),
  markdownV1: () =>
    renderMarkdownV1({
      l: "en",
      subject: "July update",
      markdown:
        "# Heading one\n\n## Heading two\n\n### Heading three\n\n#### Heading four\n\n##### Heading five\n\n###### Heading six\n\nA paragraph with **bold** and a [link](https://example.com).\n\n- One\n- Two",
      ...footerV1ExampleData,
    }),
}

const templateNames = Object.keys(renderAll)

describe("Outlook-safe common HTML across all nine public render paths", () => {
  test("covers every public template name", () => {
    expect(templateNames.length).toBe(9)
  })

  for (const name of templateNames) {
    test(`${name} emits the shared Outlook-safe head`, async () => {
      const { html } = await renderAll[name]!()

      // 96-DPI Office XML declaration, once, inside <head>
      const head = html.slice(html.indexOf("<head"), html.indexOf("</head>"))
      expect(html.match(/<o:PixelsPerInch>96<\/o:PixelsPerInch>/g)?.length).toBe(1)
      expect(head).toContain("<o:PixelsPerInch>96</o:PixelsPerInch>")
      expect(head).toContain("<!--[if mso]>")

      // Preserved React Email head metas
      expect(head).toContain(`http-equiv="Content-Type"`)
      expect(head).toContain(`name="x-apple-disable-message-reformatting"`)
      expect(head).toContain(`name="viewport"`)

      // Word renderer line-height rule
      expect(head).toContain("mso-line-height-rule:exactly")

      // Office/VML namespaces bound on the root html element
      const htmlTag = html.slice(html.indexOf("<html"), html.indexOf(">", html.indexOf("<html")) + 1)
      expect(htmlTag).toContain(`xmlns="http://www.w3.org/1999/xhtml"`)
      expect(htmlTag).toContain(`xmlns:o="urn:schemas-microsoft-com:office:office"`)
      expect(htmlTag).toContain(`xmlns:v="urn:schemas-microsoft-com:vml"`)

      // No element wrapper leaked into <head>
      expect(head).not.toContain("<div")

      // The obsolete MSO class-only width solution is gone
      expect(html).not.toContain("width:600px !important")
      expect(html).not.toContain("email-shell")
    })

    test(`${name} wraps the shell in a conditional ghost table for classic Outlook`, async () => {
      const { html } = await renderAll[name]!()
      const body = html.slice(html.indexOf("<body"))

      const opens = body.match(/<!--\[if mso\]><table role="presentation"/g)
      const closes = body.match(/<!--\[if mso\]><\/td><\/tr><\/table><!\[endif\]-->/g)

      // One ghost table for the content shell, one for the footer
      expect(opens?.length).toBe(2)
      expect(closes?.length).toBe(2)

      // Fixed structural width, plus inner padding Word cannot take from the table
      expect(body).toContain(`width="600" style="width:600px;"`)
      expect(body).toContain("padding:16px;")

      // Ghost markup opens before, and closes after, the modern container
      const openPos = body.indexOf("<!--[if mso]><table")
      const containerPos = body.indexOf("max-width:600px")
      const closePos = body.indexOf("<!--[if mso]></td></tr></table>")
      expect(openPos).toBeLessThan(containerPos)
      expect(containerPos).toBeLessThan(closePos)
    })

    test(`${name} emits no rem units and an Outlook-safe font stack`, async () => {
      const { html } = await renderAll[name]!()

      expect(html.match(/[\d.]+rem/g)).toBeNull()
      expect(html).toContain("Arial")
      expect(html).not.toContain("ui-sans-serif")
    })
  }
})

describe("CTA uses table-based, Outlook-renderable structure", () => {
  const ctaTemplates = [
    "signUpV1",
    "signInV1",
    "invitationV1",
    "orgInvitationV1",
    "teamInvitationV1",
    "passwordChangeV1",
    "emailChangeV1",
    "invoiceV1",
  ]

  for (const name of ctaTemplates) {
    test(`${name} renders the CTA as a table cell with bgcolor`, async () => {
      const { html } = await renderAll[name]!()

      expect(html).toContain(`bgcolor="#5e6ad2"`)
      // The clickable anchor sits inside the styled cell
      expect(html).toMatch(/<td align="center" bgcolor="#5e6ad2"[^>]*>\s*<a href=/)
    })
  }

  test("markdownV1 has no CTA button", async () => {
    const { html } = await renderAll.markdownV1!()
    expect(html).not.toContain(`bgcolor="#5e6ad2"`)
  })
})
