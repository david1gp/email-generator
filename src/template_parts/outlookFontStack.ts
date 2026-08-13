/**
 * Outlook-safe font stack.
 *
 * Classic Windows Outlook renders with Word, which ignores `ui-sans-serif` and
 * `system-ui` and then falls back to Times New Roman. A concrete web-safe
 * family (Segoe UI / Arial / Helvetica) must therefore be present in the stack.
 */
export const outlookFontStack =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'"
