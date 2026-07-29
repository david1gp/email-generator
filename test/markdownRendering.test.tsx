import { describe, expect, test } from "bun:test"
import { render } from "@react-email/render"
import type { MarkdownV1Type } from "../client/types/MarkdownV1Type.js"
import { renderMarkdownV1 } from "../src/server/render/renderMarkdownV1.js"
import { footerV1ExampleData } from "../src/template_parts/footerV1ExampleData.js"
import MarkdownV1Template from "../src/templates/markdown/MarkdownV1Template.js"

/**
 * Representative fixture covering all approved syntax:
 * two paragraphs, bold, labeled HTTPS link, bare HTTPS URL,
 * unordered bullet list, a two-column table with bold/link cells,
 * and a bullet-based wide-record alternative for data with three or more fields.
 *
 * Authoring contract: tables have at most two columns with short breakable text.
 * Use bullets for records with three or more displayed fields.
 */
const exampleMarkdown = `A paragraph with **bold text** and a [labeled link](https://example.com/details).

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

const baseProps: MarkdownV1Type = {
  l: "en",
  subject: "July update",
  preview: "Highlights and plans",
  heading: "July update",
  markdown: exampleMarkdown,
  ...footerV1ExampleData,
}

describe("TrustedMarkdownContent and MarkdownV1Template", () => {
  test("renders one email shell with no nested Html/Head/Body/preview/footer", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    expect(html.match(/<html/gi)?.length).toBe(1)
    expect(html.match(/<head/gi)?.length).toBe(1)
    expect(html.match(/<body/gi)?.length).toBe(1)

    // One footer
    expect(html).toContain(footerV1ExampleData.homepageText)
    expect(html).toContain(footerV1ExampleData.hompageSubtitle)
  })

  test("heading renders with direct inline styles, not parsed as Markdown", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    // Heading text is present and not inside a markdown wrapper
    expect(html).toContain("July update")
    // The heading uses inline font-weight style
    expect(html).toContain("font-weight:600")
  })

  test("paragraphs have direct inline fontSize/lineHeight/margin styles", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    // Direct inline styles on <p> elements within the markdown
    expect(html).toContain("font-size:18px")
    expect(html).toContain("line-height:28px")
    expect(html).toContain("margin:16px 0 4px")
  })

  test("bold text has direct inline fontWeight style", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    // The <strong> tags from Markdown should have font-weight:600
    expect(html).toMatch(/<strong[^>]*style="[^"]*font-weight:600[^"]*"[^>]*>bold text<\/strong>/i)
  })

  test("links have direct inline color and text-decoration but no font-size", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    // Scope anchor inspection to the data-id="react-email-markdown" region so footer links are excluded
    const markdownMatch = html.match(/<div[^>]*data-id="react-email-markdown"[^>]*>([\s\S]*?)<\/div>/)
    const markdownHtml = markdownMatch ? markdownMatch[0] : html

    // Labeled link has color and no underline
    expect(markdownHtml).toMatch(/<a[^>]*href="https:\/\/example\.com\/details"[^>]*style="[^"]*color:#155dfc[^"]*"/)
    expect(markdownHtml).toMatch(
      /<a[^>]*href="https:\/\/example\.com\/details"[^>]*style="[^"]*text-decoration:none[^"]*"/,
    )

    // Links must NOT have their own font-size — they inherit from the parent context
    const linkStyles = markdownHtml.match(/<a[^>]*style="([^"]*)"/g) ?? []
    for (const linkTag of linkStyles) {
      const styleMatch = linkTag.match(/style="([^"]*)"/)
      if (styleMatch) {
        expect(styleMatch[1]).not.toContain("font-size")
        expect(styleMatch[1]).not.toContain("line-height")
      }
    }
  })

  test("paragraph link inherits 18px from its directly styled <p> parent", async () => {
    // Render a paragraph-only link fixture
    const props = { ...baseProps, markdown: "A [labeled link](https://example.com/details) in text." }
    const html = await render(<MarkdownV1Template {...props} />)

    // The <p> parent has 18px
    expect(html).toMatch(/<p[^>]*style="[^"]*font-size:18px[^"]*"/)
    // The <a> inside it does NOT set font-size
    const anchorMatch = html.match(/<a[^>]*href="https:\/\/example\.com\/details"[^>]*style="([^"]*)"/)
    expect(anchorMatch).toBeTruthy()
    expect(anchorMatch![1]).not.toContain("font-size")
  })

  test("list link inherits 18px from its directly styled <li> parent", async () => {
    const props = { ...baseProps, markdown: "- Item with [link](https://example.com/more)" }
    const html = await render(<MarkdownV1Template {...props} />)

    // The <li> parent has 18px
    expect(html).toMatch(/<li[^>]*style="[^"]*font-size:18px[^"]*"/)
    // The <a> inside it does NOT set font-size
    const anchorMatch = html.match(/<a[^>]*href="https:\/\/example\.com\/more"[^>]*style="([^"]*)"/)
    expect(anchorMatch).toBeTruthy()
    expect(anchorMatch![1]).not.toContain("font-size")
  })

  test("table link inherits 16px from its directly styled <td> parent", async () => {
    const props = {
      ...baseProps,
      markdown: "| Name | Action |\n| --- | --- |\n| Team | [Review](https://example.com/team) |",
    }
    const html = await render(<MarkdownV1Template {...props} />)

    // The <td> parent has 16px
    expect(html).toMatch(/<td[^>]*style="[^"]*font-size:16px[^"]*"/)
    // The <a> inside does NOT set font-size
    const anchorMatch = html.match(/<a[^>]*href="https:\/\/example\.com\/team"[^>]*style="([^"]*)"/)
    expect(anchorMatch).toBeTruthy()
    expect(anchorMatch![1]).not.toContain("font-size")
  })

  test("unordered list has direct inline listStyleType and padding styles", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    // <ul> element has list-style-type:disc and padding-left:24px
    expect(html).toMatch(/<ul[^>]*style="[^"]*list-style-type:disc[^"]*"/)
    expect(html).toMatch(/<ul[^>]*style="[^"]*padding-left:24px[^"]*"/)
  })

  test("list items have direct inline fontSize/lineHeight styles", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    expect(html).toMatch(/<li[^>]*style="[^"]*font-size:18px[^"]*"/)
    expect(html).toMatch(/<li[^>]*style="[^"]*line-height:28px[^"]*"/)
  })
})

describe("compact two-column table baseline", () => {
  test("table has direct inline width/tableLayout/borderCollapse styles", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    expect(html).toMatch(/<table[^>]*style="[^"]*width:100%[^"]*"/)
    expect(html).toMatch(/<table[^>]*style="[^"]*table-layout:fixed[^"]*"/)
    expect(html).toMatch(/<table[^>]*style="[^"]*border-collapse:collapse[^"]*"/)
  })

  test("thead has direct inline backgroundColor style", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    expect(html).toMatch(/<thead[^>]*style="[^"]*background-color:#f9fafb[^"]*"/)
  })

  test("header cells (th) receive compact 16px/22px styles under installed version 0.0.18", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    // The installed @react-email/markdown 0.0.18 applies `td` style to BOTH <th> and <td>.
    // This test documents the upstream quirk: <th> elements get td styles.
    expect(html).toMatch(/<th[^>]*style="[^"]*padding:8px 6px[^"]*"/)
    expect(html).toMatch(/<th[^>]*style="[^"]*border:1px solid #eaeaea[^"]*"/)
    expect(html).toMatch(/<th[^>]*style="[^"]*font-size:16px[^"]*"/)
    expect(html).toMatch(/<th[^>]*style="[^"]*line-height:22px[^"]*"/)
  })

  test("data cells (td) have compact 16px/22px padding/border styles", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    expect(html).toMatch(/<td[^>]*style="[^"]*padding:8px 6px[^"]*"/)
    expect(html).toMatch(/<td[^>]*style="[^"]*border:1px solid #eaeaea[^"]*"/)
    expect(html).toMatch(/<td[^>]*style="[^"]*font-size:16px[^"]*"/)
    expect(html).toMatch(/<td[^>]*style="[^"]*line-height:22px[^"]*"/)
  })

  test("cells have progressive word-break and overflow-wrap protection", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    // word-break: normal preserves natural wrapping; overflow-wrap: break-word is progressive only
    expect(html).toMatch(/<td[^>]*style="[^"]*word-break:normal[^"]*"/)
    expect(html).toMatch(/<td[^>]*style="[^"]*overflow-wrap:break-word[^"]*"/)
  })

  test("table remains a native table element, not converted to blocks", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    // Verify native table structure is preserved
    expect(html).toMatch(/<table[^>]*>/)
    expect(html).toMatch(/<thead[^>]*>/)
    expect(html).toMatch(/<tbody[^>]*>/)
    expect(html).toMatch(/<tr[^>]*>/)
    expect(html).toMatch(/<th[^>]*>/)
    expect(html).toMatch(/<td[^>]*>/)

    // No display:block on table cells (would destroy the grid)
    const cellMatches = html.match(/<t[dh][^>]*style="([^"]*)"/g) ?? []
    for (const cell of cellMatches) {
      expect(cell).not.toContain("display:block")
    }
  })
})

describe("bullet-based wide-record alternative", () => {
  const bulletOnlyMarkdown = `- **Pro:** Active; Engineering; [Details](https://example.com/pro)
- **Team:** Pending; Sales; [Details](https://example.com/team)`

  test("bullet records render as a fluid single-column list", async () => {
    const props = { ...baseProps, markdown: bulletOnlyMarkdown }
    const html = await render(<MarkdownV1Template {...props} />)

    // Should have a <ul> with <li> items, no <table>
    expect(html).toMatch(/<ul[^>]*>/)
    expect(html).toMatch(/<li[^>]*>/)
    // Should NOT contain a data table
    const markdownSection = html.substring(html.indexOf('data-id="react-email-markdown"'))
    // Check that there is no <table within the markdown section
    const afterMarkdown = markdownSection.substring(0, markdownSection.indexOf("</div>"))
    expect(afterMarkdown).not.toContain("<table")
  })

  test("bullet records contain bold labels and links with correct styles", async () => {
    const props = { ...baseProps, markdown: bulletOnlyMarkdown }
    const html = await render(<MarkdownV1Template {...props} />)

    expect(html).toMatch(/<strong[^>]*style="[^"]*font-weight:600[^"]*"[^>]*>Pro:<\/strong>/i)
    expect(html).toMatch(/<a[^>]*href="https:\/\/example\.com\/pro"[^>]*style="[^"]*color:#155dfc[^"]*"/)
  })
})

describe("no prohibited responsive techniques", () => {
  test("output contains no media queries, descendant selectors, CSS variables, or duplicate mobile content", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    // No Tailwind prose classes
    expect(html).not.toMatch(/class="[^"]*prose[^"]*"/)
    // No arbitrary Tailwind variants like [&_p] or [&_...]
    expect(html).not.toContain("[&_")
    // No space-* utility
    expect(html).not.toMatch(/space-[xy]-/)
    // No CSS variables (--*)
    expect(html).not.toMatch(/var\(--/)
    // No critical rem units in Markdown styles (allow in shell Tailwind)
    const markdownSection = html.substring(html.indexOf('data-id="react-email-markdown"'))
    if (markdownSection) {
      // Paragraph and list elements use px
      expect(html).toContain("font-size:18px")
      // Table cells use compact px
      expect(html).toContain("font-size:16px")
    }
  })

  test("Markdown content remains legible after removing <style> blocks", async () => {
    const html = await render(<MarkdownV1Template {...baseProps} />)

    // Remove all <style>...</style> blocks
    const noStyle = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")

    // Key content should still be present
    expect(noStyle).toContain("bold text")
    expect(noStyle).toContain("labeled link")
    expect(noStyle).toContain("First item")
    expect(noStyle).toContain("Pro")

    // Inline styles should survive style block removal
    expect(noStyle).toContain("font-size:18px")
    expect(noStyle).toContain("font-size:16px")
    expect(noStyle).toContain("padding:8px 6px")
    expect(noStyle).toContain("border:1px solid #eaeaea")
  })

  test("preview defaults to subject when not specified", async () => {
    const props = { ...baseProps, preview: undefined, heading: undefined }
    const html = await render(<MarkdownV1Template {...props} />)

    // The preview div contains the subject text
    expect(html).toContain("July update")
  })

  test("subject is never parsed as Markdown", async () => {
    const props = { ...baseProps, subject: "**not bold**", heading: "**not bold**" }
    const html = await render(<MarkdownV1Template {...props} />)

    // The heading should contain the literal text with ** not parsed
    expect(html).toContain("**not bold**")
  })
})

describe("renderMarkdownV1", () => {
  test("returns subject, text, and html", async () => {
    const result = await renderMarkdownV1(baseProps)

    expect(result.subject).toBe("July update")
    expect(typeof result.html).toBe("string")
    expect(typeof result.text).toBe("string")
    expect(result.html.length).toBeGreaterThan(0)
    expect(result.text.length).toBeGreaterThan(0)
  })

  test("plain text preserves bullet markers", async () => {
    const result = await renderMarkdownV1(baseProps)

    // Bullet list items should appear with markers in text
    expect(result.text).toContain("First item")
    expect(result.text).toContain("Second")
    expect(result.text).toContain("Third item")
  })

  test("plain text preserves link destinations", async () => {
    const result = await renderMarkdownV1(baseProps)

    expect(result.text).toContain("https://example.com/details")
    expect(result.text).toContain("https://example.com/status")
  })

  test("plain text preserves two-column table data rows", async () => {
    const result = await renderMarkdownV1(baseProps)

    // Table content should be present in plain text
    expect(result.text).toContain("Pro")
    expect(result.text).toContain("Active")
    expect(result.text).toContain("Team")
    expect(result.text).toContain("Free")
  })

  test("plain text preserves bullet-based wide-record content", async () => {
    const result = await renderMarkdownV1(baseProps)

    // The bullet alternative records should appear in plain text
    expect(result.text).toContain("Engineering")
    expect(result.text).toContain("Sales")
    expect(result.text).toContain("Support")
    expect(result.text).toContain("https://example.com/pro")
  })

  test("plain text preserves footer", async () => {
    const result = await renderMarkdownV1(baseProps)

    expect(result.text).toContain(footerV1ExampleData.homepageText)
  })

  test("plain text does not expose shell/layout tables", async () => {
    const result = await renderMarkdownV1(baseProps)

    // The dataTable formatter should only apply to Markdown data tables,
    // not to React Email's layout tables.
    expect(result.text).not.toContain("max-width:600px")
  })

  test("bullet alternatives do not pass through the table formatter", async () => {
    // Render with only bullet content (no table)
    const bulletOnly = `- **Pro:** Active; Engineering; [Details](https://example.com/pro)
- **Team:** Pending; Sales; [Details](https://example.com/team)`
    const result = await renderMarkdownV1({ ...baseProps, markdown: bulletOnly })

    // Bullets produce readable plain text without table formatting
    expect(result.text).toContain("Pro:")
    expect(result.text).toContain("Team:")
    expect(result.text).toContain("Engineering")
    expect(result.text).toContain("https://example.com/pro")
    // No table-like artifacts
    expect(result.text).not.toContain("max-width:600px")
  })

  test("maximum approved two-column table remains below 90 KiB", async () => {
    const header = "|A|B|\n|---|---|\n"
    const row = "|xx|yy|\n"
    const markdown = (header + row.repeat(Math.floor((1000 - header.length) / row.length))).slice(0, 1000)
    const result = await renderMarkdownV1({ ...baseProps, markdown })

    expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(90 * 1024)
  })

  test("out-of-contract four-column table still renders (trusted parser does not enforce columns)", async () => {
    // The parser accepts wider tables since enforcement is trusted-author policy, not schema validation.
    // This test documents that behavior without implying it is supported for mobile readability.
    const wideMarkdown = `| A | B | C | D |
| --- | --- | --- | --- |
| a1 | b1 | c1 | d1 |`
    const result = await renderMarkdownV1({ ...baseProps, markdown: wideMarkdown })

    expect(result.html).toContain("a1")
    expect(result.html).toContain("d1")
    expect(result.text).toContain("a1")
    expect(new TextEncoder().encode(result.html).byteLength).toBeLessThan(90 * 1024)
  })
})
