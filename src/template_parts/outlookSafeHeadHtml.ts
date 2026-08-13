/** Shared content width of the email shell, in CSS pixels. */
export const emailContentWidthPx = 600

/**
 * Complete <head> content shared by every public template.
 *
 * Emitted as raw HTML (and not through `<Head>`) because conditional comments
 * cannot be expressed in JSX, and a wrapper element inside <head> would be
 * invalid HTML that parsers move into the body.
 *
 * - The first two meta tags reproduce what `@react-email/components` `<Head>`
 *   renders, so the shell is unchanged for non-Outlook clients.
 * - The Office XML declaration pins classic Windows Outlook to 96 DPI, so pixel
 *   widths are not scaled up on high-DPI Windows displays.
 * - `mso-line-height-rule: exactly` stops the Word renderer from adding extra
 *   leading to every line box.
 * The Word renderer ignores `max-width`, so the shared content width is given to
 * classic Outlook by the conditional ghost tables in `MsoGhostTable`, not by a
 * class rule in this <style> block (Word applies class rules unreliably and
 * still would not fix table padding).
 */
export const outlookSafeHeadHtml =
  `<meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>` +
  `<meta name="x-apple-disable-message-reformatting"/>` +
  `<meta name="viewport" content="width=device-width, initial-scale=1"/>` +
  "<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->" +
  "<style>body,table,td,p,a,h1,h2,h3,li{mso-line-height-rule:exactly;}</style>"
