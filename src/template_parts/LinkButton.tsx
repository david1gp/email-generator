import { Link } from "@react-email/components"
import type { MayHaveClassName } from "../utils/MayHaveClassName.js"
import { outlookFontStack } from "./outlookFontStack.js"

/**
 * Table-based CTA.
 *
 * Classic Windows Outlook (Word renderer) does not apply padding, border-radius
 * or background-color reliably to an `<a>`. The visible button is therefore a
 * `<td>` carrying `bgcolor` plus padding, with a full-width `<a>` inside for the
 * click target. This keeps the same appearance in modern clients while giving
 * Outlook a structure it can render (no VML shape needed, because the button is
 * fluid width and the square-cornered fallback is acceptable).
 */
export interface LinkButtonProps extends MayHaveClassName {
  url: string
  text: string
}

export function LinkButton(p: LinkButtonProps) {
  return (
    <table role="presentation" border={0} cellPadding="0" cellSpacing="0" width="100%" className={p.className}>
      <tbody>
        <tr>
          {/* bgcolor is a presentational attribute classic Outlook honours; React types omit it */}
          <td align="center" {...({ bgcolor: buttonBackgroundColor } as { bgcolor: string })} style={buttonCellStyle}>
            <Link href={p.url} style={buttonLinkStyle}>
              {p.text}
            </Link>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

const buttonBackgroundColor = "#5e6ad2"

const buttonCellStyle = {
  backgroundColor: buttonBackgroundColor,
  borderRadius: "4px",
  padding: "12px 24px",
  textAlign: "center" as const,
}

const buttonLinkStyle = {
  fontFamily: outlookFontStack,
  fontWeight: "600",
  color: "#fff",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
}
