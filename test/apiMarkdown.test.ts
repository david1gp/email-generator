import { describe, expect, test } from "bun:test"
import { apiGenerateEmailMarkdownV1 } from "../client/apiGenerateEmailMarkdownV1.js"
import { apiPathRenderEmailTemplate } from "../client/apiPathRenderEmailTemplate.js"
import { emailTemplateName } from "../client/emailTemplateName.js"
import type { MarkdownV1Type } from "../client/types/MarkdownV1Type.js"
import { footerV1ExampleData } from "../src/template_parts/footerV1ExampleData.js"
import { getTargetBaseUrl, targetEnv } from "./targetEnv.js"

const supportedMarkdownFixture = `A paragraph with **bold text** and a [labeled link](https://example.com/details).

Second paragraph with a bare URL: https://example.com/status

- First item
- Second **bold** item
- Third item with [link](https://example.com/more)

| Plan | Status |
| --- | --- |
| Pro | **Active** |
| Team | [Pending review](https://example.com/team) |
| Free | Inactive |

- **Pro:** Active; Engineering; [Details](https://example.com/pro)
- **Team:** Pending; Sales; [Details](https://example.com/team)
- **Free:** Inactive; Support; [Details](https://example.com/free)`

const validProps: MarkdownV1Type = {
  l: "en",
  subject: "July update",
  preview: "Highlights and plans",
  heading: "July update",
  markdown: supportedMarkdownFixture,
  ...footerV1ExampleData,
}

describe("apiMarkdown integration tests", () => {
  const getBaseUrl = () => getTargetBaseUrl(targetEnv.readFromEnv)

  test("apiGenerateEmailMarkdownV1 succeeds with valid input", async () => {
    const baseUrl = getBaseUrl()
    const result = await apiGenerateEmailMarkdownV1(validProps, baseUrl)

    if (!result.success) {
      console.error(result)
    }
    expect(result.success).toBe(true)
    if (!result.success) return

    const data = result.data
    expect(data.subject).toBe("July update")
    expect(data.html).toContain("July update")
    expect(data.html).toContain("bold text")
    expect(data.html).toContain("https://example.com/details")
    expect(data.html).toContain("Engineering")
    expect(data.text).toContain("First item")
  })

  test("returns Cache-Control: no-store header on success", async () => {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/${apiPathRenderEmailTemplate}/${emailTemplateName.markdownV1}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validProps),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toBe("no-store")
  })

  test("returns 400 on malformed JSON body", async () => {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/${apiPathRenderEmailTemplate}/${emailTemplateName.markdownV1}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{ malformed json",
    })

    expect(response.status).toBe(400)
  })

  test("returns 400 when subject contains CR/LF", async () => {
    const baseUrl = getBaseUrl()
    const invalidProps = { ...validProps, subject: "Subject with\nnewline" }
    const response = await fetch(`${baseUrl}/${apiPathRenderEmailTemplate}/${emailTemplateName.markdownV1}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidProps),
    })

    expect(response.status).toBe(400)
    const err = await response.json()
    expect(err).toHaveProperty("success", false)
  })

  test("returns 400 when markdown body is empty", async () => {
    const baseUrl = getBaseUrl()
    const invalidProps = { ...validProps, markdown: "" }
    const response = await fetch(`${baseUrl}/${apiPathRenderEmailTemplate}/${emailTemplateName.markdownV1}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidProps),
    })

    expect(response.status).toBe(400)
  })

  test("returns 400 when markdown contains only whitespace", async () => {
    const baseUrl = getBaseUrl()
    const invalidProps = { ...validProps, markdown: " \n\t " }
    const response = await fetch(`${baseUrl}/${apiPathRenderEmailTemplate}/${emailTemplateName.markdownV1}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidProps),
    })

    expect(response.status).toBe(400)
  })

  test("returns 400 when markdown exceeds 1,000 characters limit", async () => {
    const baseUrl = getBaseUrl()
    const oversizedMarkdown = "a".repeat(1001)
    const invalidProps = { ...validProps, markdown: oversizedMarkdown }
    const response = await fetch(`${baseUrl}/${apiPathRenderEmailTemplate}/${emailTemplateName.markdownV1}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidProps),
    })

    expect(response.status).toBe(400)
  })

  test("returns 413 when total request body exceeds size limit (32,768 bytes)", async () => {
    const baseUrl = getBaseUrl()
    const oversizedPadding = " ".repeat(35000)
    const bodyStr = JSON.stringify({ ...validProps, padding: oversizedPadding })
    const response = await fetch(`${baseUrl}/${apiPathRenderEmailTemplate}/${emailTemplateName.markdownV1}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyStr,
    })

    expect(response.status).toBe(413)
  })
})
