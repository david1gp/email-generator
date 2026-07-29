import { Markdown } from "@react-email/components"
import type React from "react"

export interface TrustedMarkdownContentProps {
  markdown: string
}

/**
 * Conservative web-safe/system font stack for email rendering.
 */
const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'"

/**
 * Container baseline: literal font family and text color.
 * Does NOT use descendant selectors, Tailwind prose, or CSS variables.
 */
const markdownContainerStyles: React.CSSProperties = {
  fontFamily,
  color: "#000000",
}

/**
 * Compact shared cell style for the two-column intrinsic table baseline.
 *
 * The installed @react-email/markdown 0.0.18 applies the `td` style entry
 * to BOTH emitted <th> and <td> elements. The declared `th` entry is NOT
 * read by the installed version but is kept for documentation, forward
 * compatibility, and intent visibility.
 *
 * Cell dimensions (16 px / 22 px / 8px 6px padding) are sized so two
 * short-text columns remain readable at a nominal 320 px viewport without
 * media queries, descendant selectors, or overflow scrolling.
 *
 * word-break: normal and overflow-wrap: break-word are progressive
 * protection only. Authored content must contain natural break opportunities
 * (spaces, hyphens). Do not rely on these properties — classic Outlook
 * Windows does not support overflow-wrap and word-break support is partial.
 */
const sharedCellStyle: React.CSSProperties = {
  padding: "8px 6px",
  border: "1px solid #eaeaea",
  fontSize: 16,
  lineHeight: "22px",
  textAlign: "left" as const,
  color: "#000000",
  wordBreak: "normal",
  overflowWrap: "break-word",
}

/**
 * Complete per-element inline style map. Every supported element gets
 * its critical styles directly — no wrapper descendant CSS, no Tailwind prose,
 * no arbitrary variants, no child/sibling selectors, no space-* utilities.
 */
const markdownCustomStyles = {
  p: {
    fontSize: 18,
    lineHeight: "28px",
    margin: "16px 0 4px",
    color: "#000000",
  },
  bold: {
    fontWeight: 600,
  },
  link: {
    color: "#155dfc",
    textDecoration: "none",
  },
  ul: {
    listStyleType: "disc" as const,
    paddingLeft: 24,
    margin: "16px 0 4px",
  },
  li: {
    fontSize: 18,
    lineHeight: "28px",
    margin: "0 0 4px",
    color: "#000000",
  },
  table: {
    width: "100%",
    tableLayout: "fixed" as const,
    borderCollapse: "collapse" as const,
    backgroundColor: "#ffffff",
    margin: "8px 0 16px",
  },
  thead: {
    backgroundColor: "#f9fafb",
    fontWeight: 600,
    color: "#000000",
  },
  tbody: {
    backgroundColor: "#ffffff",
  },
  tr: {
    verticalAlign: "top" as const,
  },
  // th: kept for intent/forward-compatibility; NOT read by @react-email/markdown 0.0.18
  th: {
    padding: "8px 6px",
    border: "1px solid #eaeaea",
    fontSize: 16,
    lineHeight: "22px",
    fontWeight: 600,
    textAlign: "left" as const,
    color: "#000000",
    wordBreak: "normal",
    overflowWrap: "break-word",
  },
  // td: the installed version applies this to BOTH <th> and <td> elements
  td: {
    ...sharedCellStyle,
  },
} as const

export function TrustedMarkdownContent(p: TrustedMarkdownContentProps) {
  return (
    <Markdown markdownContainerStyles={markdownContainerStyles} markdownCustomStyles={markdownCustomStyles}>
      {p.markdown}
    </Markdown>
  )
}
