import { describe, expect, test } from "bun:test"
import { render } from "@react-email/render"
import { renderEmailChangeV1 } from "../src/server/render/renderEmailChangeV1.js"
import { renderInvitationV1 } from "../src/server/render/renderInvitationV1.js"
import { renderInvoiceV1 } from "../src/server/render/renderInvoiceV1.js"
import { renderMarkdownV1 } from "../src/server/render/renderMarkdownV1.js"
import { renderPasswordChangeV1 } from "../src/server/render/renderPasswordChangeV1.js"
import { renderSignInV1 } from "../src/server/render/renderSignInV1.js"
import { renderSignUpV1 } from "../src/server/render/renderSignUpV1.js"
import { footerV1ExampleData } from "../src/template_parts/footerV1ExampleData.js"
import EmailChangeV1Template from "../src/templates/email_change/EmailChangeV1Template.js"
import InvitationV1Template from "../src/templates/invitation/InvitationV1Template.js"
import InvoiceV1Template from "../src/templates/invoice/InvoiceV1Template.js"
import PasswordChangeV1Template from "../src/templates/password_change/PasswordChangeV1Template.js"
import SignInV1Template from "../src/templates/sign_in/SignInV1Template.js"
import SignUpV1Template from "../src/templates/sign_up/SignUpV1Template.js"

describe("EmailLayout", () => {
  const signInProps = {
    l: "en" as const,
    code: "ABC-123",
    url: "https://example.com/sign-in?code=ABC123",
    ...footerV1ExampleData,
  }

  test("SignIn template has one HTML document with preview, body, container, and footer", async () => {
    const html = await render(<SignInV1Template {...signInProps} />)

    // One document shell
    expect(html.match(/<html/gi)?.length).toBe(1)
    expect(html.match(/<head/gi)?.length).toBe(1)
    expect(html.match(/<body/gi)?.length).toBe(1)

    // Preview text present
    expect(html).toContain("ABC-123")

    // 600px container
    expect(html).toContain("600px")

    // Footer present
    expect(html).toContain(footerV1ExampleData.homepageText)
    expect(html).toContain(footerV1ExampleData.hompageSubtitle)
  })

  test("SignIn plain text preserves subject/body/footer order", async () => {
    const text = await render(<SignInV1Template {...signInProps} />, { plainText: true })

    expect(text).toContain("ABC-123")
    expect(text).toContain(footerV1ExampleData.homepageText)

    // Footer appears after content
    const codePos = text.indexOf("ABC-123")
    const footerPos = text.indexOf(footerV1ExampleData.homepageText)
    expect(footerPos).toBeGreaterThan(codePos)
  })

  test("Invoice template retains shell structure with EmailLayout", async () => {
    const invoiceProps = {
      l: "en" as const,
      isPaid: true,
      url: "https://example.com/invoices/INV-1024",
      customerId: "CUS-5567",
      invoiceId: "INV-1024",
      amount: "$149.00",
      ...footerV1ExampleData,
    }

    const html = await render(<InvoiceV1Template {...invoiceProps} />)

    expect(html.match(/<html/gi)?.length).toBe(1)
    expect(html.match(/<head/gi)?.length).toBe(1)
    expect(html.match(/<body/gi)?.length).toBe(1)
    expect(html).toContain("INV-1024")
    expect(html).toContain("$149.00")
    expect(html).toContain(footerV1ExampleData.homepageText)
  })

  test("SignUp template works with EmailLayout", async () => {
    const html = await render(
      <SignUpV1Template l="en" code="XYZ-789" url="https://example.com/sign-up?code=XYZ789" {...footerV1ExampleData} />,
    )
    expect(html.match(/<html/gi)?.length).toBe(1)
    expect(html).toContain("XYZ-789")
  })

  test("Invitation template works with EmailLayout", async () => {
    const html = await render(
      <InvitationV1Template
        l="en"
        invitedName="Bob"
        invitedByName="Alice"
        invitedByEmail="alice@example.com"
        entityName="Acme Inc"
        url="https://example.com/join"
        {...footerV1ExampleData}
      />,
    )
    expect(html.match(/<html/gi)?.length).toBe(1)
    expect(html).toContain("Acme Inc")
    expect(html).toContain("Bob")
  })

  test("PasswordChange template works with EmailLayout", async () => {
    const html = await render(
      <PasswordChangeV1Template
        l="en"
        userName="Bob"
        code="483920"
        url="https://example.com/reset"
        expiryMinutes={10}
        {...footerV1ExampleData}
      />,
    )
    expect(html.match(/<html/gi)?.length).toBe(1)
    expect(html).toContain("483920")
  })

  test("EmailChange template works with EmailLayout", async () => {
    const html = await render(
      <EmailChangeV1Template
        l="en"
        userName="Bob"
        code="729481"
        url="https://example.com/change-email"
        expiryMinutes={10}
        {...footerV1ExampleData}
      />,
    )
    expect(html.match(/<html/gi)?.length).toBe(1)
    expect(html).toContain("729481")
  })
})

describe("Pre-send HTML 90 KiB size budget across all supported templates", () => {
  const PRE_SEND_BUDGET_BYTES = 90 * 1024 // 92,160 bytes

  test("signUpV1 generated pre-send HTML stays under 90 KiB", async () => {
    const result = await renderSignUpV1({
      l: "en",
      code: "XYZ-789",
      url: "https://example.com/sign-up?code=XYZ789",
      ...footerV1ExampleData,
    })
    expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(PRE_SEND_BUDGET_BYTES)
  })

  test("signInV1 generated pre-send HTML stays under 90 KiB", async () => {
    const result = await renderSignInV1({
      l: "en",
      code: "ABC-123",
      url: "https://example.com/sign-in?code=ABC123",
      ...footerV1ExampleData,
    })
    expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(PRE_SEND_BUDGET_BYTES)
  })

  test("invitationV1 generated pre-send HTML stays under 90 KiB", async () => {
    const result = await renderInvitationV1({
      l: "en",
      invitedName: "Bob",
      invitedByName: "Alice",
      invitedByEmail: "alice@example.com",
      entityName: "Acme Inc",
      url: "https://example.com/join",
      ...footerV1ExampleData,
    })
    expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(PRE_SEND_BUDGET_BYTES)
  })

  test("orgInvitationV1 generated pre-send HTML stays under 90 KiB", async () => {
    const result = await renderInvitationV1({
      l: "en",
      invitedName: "Bob",
      invitedByName: "Alice",
      invitedByEmail: "alice@example.com",
      entityName: "Acme Org",
      entity: "organization",
      url: "https://example.com/join-org",
      ...footerV1ExampleData,
    })
    expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(PRE_SEND_BUDGET_BYTES)
  })

  test("teamInvitationV1 generated pre-send HTML stays under 90 KiB", async () => {
    const result = await renderInvitationV1({
      l: "en",
      invitedName: "Bob",
      invitedByName: "Alice",
      invitedByEmail: "alice@example.com",
      entityName: "Acme Team",
      entity: "team",
      url: "https://example.com/join-team",
      ...footerV1ExampleData,
    })
    expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(PRE_SEND_BUDGET_BYTES)
  })

  test("passwordChangeV1 generated pre-send HTML stays under 90 KiB", async () => {
    const result = await renderPasswordChangeV1({
      l: "en",
      userName: "Bob",
      code: "483920",
      url: "https://example.com/reset",
      expiryMinutes: 10,
      ...footerV1ExampleData,
    })
    expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(PRE_SEND_BUDGET_BYTES)
  })

  test("emailChangeV1 generated pre-send HTML stays under 90 KiB", async () => {
    const result = await renderEmailChangeV1({
      l: "en",
      userName: "Bob",
      code: "729481",
      url: "https://example.com/change-email",
      expiryMinutes: 10,
      ...footerV1ExampleData,
    })
    expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(PRE_SEND_BUDGET_BYTES)
  })

  test("invoiceV1 (paid and unpaid) generated pre-send HTML stays under 90 KiB", async () => {
    const resultPaid = await renderInvoiceV1({
      l: "en",
      isPaid: true,
      url: "https://example.com/invoices/INV-1024",
      customerId: "CUS-5567",
      invoiceId: "INV-1024",
      amount: "$149.00",
      ...footerV1ExampleData,
    })
    expect(new TextEncoder().encode(resultPaid.html).byteLength).toBeLessThan(PRE_SEND_BUDGET_BYTES)

    const resultUnpaid = await renderInvoiceV1({
      l: "en",
      isPaid: false,
      url: "https://example.com/invoices/INV-1025",
      customerId: "CUS-5567",
      invoiceId: "INV-1025",
      amount: "$299.00",
      ...footerV1ExampleData,
    })
    expect(new TextEncoder().encode(resultUnpaid.html).byteLength).toBeLessThan(PRE_SEND_BUDGET_BYTES)
  })

  test("markdownV1 supported input profile generated pre-send HTML stays under 90 KiB", async () => {
    const header = "| Plan | Status |\n| --- | --- |\n"
    const row = "| Pro | **Active** |\n| Team | [Pending](https://example.com/team) |\n"
    const tableMarkdown = (header + row.repeat(20)).slice(0, 600)
    const supportedMarkdown = `A paragraph with **bold text** and a [labeled link](https://example.com/details).

Second paragraph with a bare URL: https://example.com/status

- **Pro:** Active; Engineering; [Details](https://example.com/pro)
- **Team:** Pending; Sales; [Details](https://example.com/team)
- **Free:** Inactive; Support; [Details](https://example.com/free)

${tableMarkdown}`.slice(0, 1000)

    const result = await renderMarkdownV1({
      l: "en",
      subject: "July update",
      preview: "Highlights and plans",
      heading: "July update",
      markdown: supportedMarkdown,
      ...footerV1ExampleData,
    })
    expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(PRE_SEND_BUDGET_BYTES)
  })
})
