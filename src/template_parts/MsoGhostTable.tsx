import { emailContentWidthPx } from "./outlookSafeHeadHtml.js"

/**
 * Classic-Outlook "ghost table" boundary.
 *
 * The Word renderer used by classic Windows Outlook ignores `max-width` and does
 * not apply padding to `<table>` elements, so the shared 600 px shell and its
 * inner spacing cannot be expressed with CSS alone. The fixed width and the
 * padding are therefore given to Outlook only, through a conditional-comment
 * table that wraps the real (modern) markup:
 *
 *   <!--[if mso]><table width="600" ...><tr><td style="padding:...">
 *     ...unchanged modern markup...
 *   <!--[if mso]></td></tr></table>
 *
 * Every other client sees only HTML comments, so the modern layout is unchanged.
 * The comments are emitted through `<span>` elements because conditional
 * comments cannot be expressed as JSX (the same technique `@react-email/button`
 * uses); an empty inline span does not affect layout.
 */
export interface MsoGhostTableProps {
  /** CSS padding applied to the ghost cell, e.g. `"16px"`. Omit for none. */
  padding?: string
  /** Background colour of the ghost cell, e.g. `"#ffffff"`. Omit for none. */
  backgroundColor?: string
  children: React.ReactNode
}

export function MsoGhostTable(p: MsoGhostTableProps) {
  const cellStyle = [
    p.padding ? `padding:${p.padding};` : "",
    p.backgroundColor ? `background-color:${p.backgroundColor};` : "",
  ].join("")

  const open =
    `<!--[if mso]><table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" ` +
    `width="${emailContentWidthPx}" style="width:${emailContentWidthPx}px;"><tr><td${cellStyle ? ` style="${cellStyle}"` : ""}><![endif]-->`

  const close = "<!--[if mso]></td></tr></table><![endif]-->"

  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, non-user Outlook markup */}
      <span dangerouslySetInnerHTML={{ __html: open }} />
      {p.children}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, non-user Outlook markup */}
      <span dangerouslySetInnerHTML={{ __html: close }} />
    </>
  )
}

export default MsoGhostTable
