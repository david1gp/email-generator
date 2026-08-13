# Outlook email template hardening

## Goal

Confirm the Billing Outlook work against authoritative online guidance, apply the required Outlook-safe HTML to every email-generator template, validate the rendered templates, commit and release the package, then redeploy Billing.

## Decisions

- Treat the Billing implementation and logs as evidence to review, not as the final source of truth.
- Make the smallest shared change that covers all email-generator templates without changing their intended appearance in modern clients.
- Release email-generator before redeploying Billing.
- The confirmed fixes target classic Windows Outlook's Word renderer; New Outlook uses a browser engine and does not require them.
- Avoid `rem` units in email output, include an Outlook-safe font fallback, provide structural table widths, add the 96-DPI Office XML declaration, and use table/VML-safe CTA structure where applicable.
- After releasing email-generator, upgrade Billing from `@adaptive-ds/email-generator@0.18.0`, remove its local generated-offer hardener, validate, and restart the `billing` user service.
- Cover all nine public templates through the shared `src/template_parts/EmailLayout.tsx`; keep template-specific CTA markup changes in the affected templates.
- Preserve the existing untracked plan document; the worktree otherwise starts clean on `main`.
- Bind Office/VML namespaces on the root HTML element, override Markdown heading sizes with pixels, and exercise headings in regression tests.
- Use a classic-Outlook ghost table for the 600px shell so width and inner spacing do not depend on Word honoring `max-width`, table padding, or an MSO class rule.

## Approach

- Inspect email-generator and the Billing hardener over SSH, and compare the rules with authoritative Outlook/email HTML documentation.
- Implement the confirmed rules at the appropriate shared rendering boundary and add focused regression coverage.
- Validate source tests, types, representative rendered HTML, and browser-visible output where applicable.
- Commit the intended email-generator changes, run the release, then update/redeploy Billing as required by the released package.

## Tasks

1. [done] Inventory local templates and identify the shared rendering and test boundaries.
2. [done] Inspect the remote Billing hardener and its release/deploy integration.
3. [done] Confirm each proposed Outlook rule against authoritative online guidance.
4. [done] Complete Outlook-safe output for all templates and focused tests.
5. [done] Revalidate all templates and rendered output.
6. [done] Commit the email-generator changes and run `bun run release`.
7. [done] Update and redeploy Billing, then confirm deployment health.

## Paths

- `docs/20260813_outlook_email_template_hardening.md`
- `src/template_parts/EmailLayout.tsx`
- `src/template_parts/LinkButton.tsx`
- `src/template_parts/MsoGhostTable.tsx`
- `src/template_parts/TrustedMarkdownContent.tsx`
- `src/template_parts/outlookFontStack.ts`
- `src/template_parts/outlookSafeHeadHtml.ts`
- `src/templates/`
- `src/server/render/`
- `test/emailLayout.test.tsx`
- `test/markdownRendering.test.tsx`
- `test/outlookSafeHtml.test.tsx`
- `package.json`
- `leo@leo-server:~/projects/billing`
