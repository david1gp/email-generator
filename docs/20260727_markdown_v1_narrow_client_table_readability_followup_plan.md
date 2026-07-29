# MarkdownV1 Narrow-Client Table Readability Follow-Up Plan

Date: 2026-07-27
Status: Research and future implementation plan only. This document does not implement application code.

## Recommended Solution

Keep the current trusted React Email Markdown model, but stop treating four-column data tables as a mobile-safe contract.

Use an intrinsic, no-query baseline:

1. Preserve real Markdown tables when the data is naturally narrow: at most two columns, one header row, short breakable cell content, and labeled links rather than bare URLs.
2. Give retained tables compact direct inline styles: `width: 100%`, `table-layout: fixed`, collapsed borders, 16 px cell text, 22 px line height, and `8px 6px` cell padding.
3. Remove the fixed 18 px/28 px typography from the global Markdown link style so links inherit the directly styled paragraph, list-item, or table-cell context. Keep link color and decoration inline.
4. Treat ordinary whitespace wrapping plus trusted-author content constraints as the required fallback. An inline `overflow-wrap: break-word` may be added as progressive protection, paired with `word-break: normal`, but acceptance must not depend on either property.
5. Author data with three or more fields per record as a one-column bullet summary, or transpose a single record into a two-column key/value table. Do not emit a wide table plus a hidden mobile duplicate.
6. Keep the existing table-aware plain-text formatter for retained tables. Bullet alternatives already produce readable plain text without new rendering logic.

Example authoring decision:

```md
| Plan | Status |
| --- | --- |
| Pro | Active |
| Team | Pending |
```

remains a table on desktop and narrow clients, while the current four-field records become:

```md
- **Pro:** Active; Engineering; [Details](https://example.com/pro)
- **Team:** Pending; Sales; [Details](https://example.com/team)
```

This is the smallest dependable approach because it never needs to detect viewport width. It preserves desktop tables where a table can also fit a narrow client and uses the project's already-approved paragraph/bold/list/link profile where a grid cannot fit. There is no robust way to simultaneously retain an arbitrary wide desktop grid, transform it only on narrow clients, avoid media queries and visibility selectors, and keep the current built-in Markdown renderer.

## Conversation Summary

The work leading to this follow-up is recorded in:

- `docs/20260727_markdown_email_content_and_shared_layout_plan.md`
- `docs/20260727_react_email_vs_mjml_markdown_architecture_plan.md`
- `docs/20260727_trusted_author_react_email_markdown_architecture_plan.md`
- `docs/20260727_trusted_markdown_email_descendant_styling_followup_plan.md`
- `docs/20260727_trusted_markdown_table_email_implementation_plan.md`

The conversation first selected React Email over MJML or an internal compiler, then established a trusted-author and authenticated-delivery model for Markdown. It selected React Email's built-in `Markdown` component because policy and review are sufficient while content remains solely trusted and no untrusted values are interpolated. A constrained AST renderer remains the escalation path if provenance or technical enforcement requirements change.

The styling follow-up established that generated Markdown children must receive complete direct inline styles through `markdownCustomStyles`. Critical appearance must not depend on Tailwind `prose`, arbitrary descendant variants, `space-*`, complex selectors, retained head styles, CSS variables, or media-query-only rules.

The table implementation then approved simple GFM tables, a shared `EmailLayout`, a versioned `markdownV1` endpoint, direct table/cell styles, scoped table-to-plain-text conversion, authentication, validation, and output-size limits. That implementation now exists. Its authoring contract permits up to four columns, but its current visual fixture is too dense to be a sound narrow-client baseline. This follow-up resolves that remaining issue without changing the trust architecture or implementing code in this task.

## Current Implementation

### Rendering And Contract

- `client/types/MarkdownV1Type.ts` exposes `subject`, optional `preview` and `heading`, `markdown`, language, and footer fields.
- `src/server/schemas/markdownV1Schema.ts` validates the request. Markdown is nonblank and limited to 1,000 characters; plain-text subject fields are bounded at 200 characters.
- `src/server/api/apiRouteDef.ts` registers `markdownV1`, requires bearer authentication, and limits the request body to 32,768 bytes.
- `src/server/routes/addRoutesTemplates.ts` authenticates before reading the body, enforces the byte limit, parses JSON, runs the registered Valibot schema, renders, and returns `Cache-Control: no-store`.
- `src/server/render/renderMarkdownV1.tsx` renders HTML once and derives text with the scoped selector `[data-id=react-email-markdown]>table` and `dataTable` formatter.
- `README.md` currently documents simple pipe tables with at most four columns.

### Template And Styling

- `src/templates/markdown/MarkdownV1Template.tsx` composes one escaped heading, `TrustedMarkdownContent`, and the shared layout. Its preview fixture contains a four-column `Plan / Status / Owner / Link` table.
- `src/template_parts/EmailLayout.tsx` emits the shared document, preview, Tailwind shell, 100%-wide main presentation table with `max-width: 600px`, 1 rem padding, border, and footer.
- `src/template_parts/TrustedMarkdownContent.tsx` is the only Markdown wrapper and style owner. It warns that input is trusted and unsanitized.
- The current table style is direct and inline: `width: 100%`, `table-layout: fixed`, `border-collapse: collapse`, white background, and fixed margins.
- The current shared cell style is 18 px/28 px with 12 px padding and a 1 px border. Four equal columns therefore spend 24 px of every column on horizontal padding before rendering text.
- The current link style is always 18 px/28 px. A link inside a future compact cell would remain oversized unless those dimensions are allowed to inherit from its cell.
- Installed `@react-email/markdown` is `0.0.18`. Its table renderer emits native `table`, `thead`, `tbody`, `tr`, `th`, and `td` tags through `dangerouslySetInnerHTML`.
- The installed renderer applies the `td` style map to both `<th>` and `<td>`. The existing `th` map documents intent but is not currently read.
- The built-in component accepts styles but no table renderer, node component map, class-name contract, table attributes, `scope` attributes, parser policy, or viewport-specific output hook.

The current representative table renders as:

```html
<table style="width:100%;table-layout:fixed;border-collapse:collapse;background-color:#ffffff;margin:8px 0 16px">
  <thead style="background-color:#f9fafb;font-weight:600;color:#000000">
    <tr style="vertical-align:top">
      <th style="padding:12px;border:1px solid #eaeaea;font-size:18px;line-height:28px;text-align:left;color:#000000">Plan</th>
      <th style="padding:12px;border:1px solid #eaeaea;font-size:18px;line-height:28px;text-align:left;color:#000000">Status</th>
      <th style="padding:12px;border:1px solid #eaeaea;font-size:18px;line-height:28px;text-align:left;color:#000000">Owner</th>
      <th style="padding:12px;border:1px solid #eaeaea;font-size:18px;line-height:28px;text-align:left;color:#000000">Link</th>
    </tr>
  </thead>
  <!-- body rows use the same cell dimensions -->
</table>
```

At a nominal 320 px viewport, the shell padding and borders leave substantially less than 320 px for content. Four fixed columns can be roughly 70 px each before client-specific table box-model differences; the existing 24 px horizontal cell padding then leaves little room for 18 px text. A passing browser render or presence of `width:100%` does not prove readability.

### Current Tests And Baseline

- `test/markdownRendering.test.tsx` covers the shell, heading, direct styles for all approved elements, the installed header-cell quirk, style-block removal, HTML/text response shape, links, bullets, table text, footer text, and a 90 KiB maximum fixture.
- Its table assertions verify style strings, not layout at a narrow width, clipping, horizontal expansion, minimum readable text size, or row/header association after wrapping.
- Its representative and size fixtures are explicitly four-column tables.
- `test/apiMarkdown.test.ts` uses the same four-column supported fixture and covers auth, no-store, malformed JSON, field validation, the 1,000-character limit, and the request-byte limit.
- `test/emailLayout.test.tsx` protects the shared shell but has no narrow-width visual assertion.
- `test/openapi.test.ts` protects route security and response codes.
- `src/templates/emailTemplateScreenshot.ts` maps `markdownV1` to the generated hosted screenshot, but a desktop screenshot alone cannot validate narrow behavior.

Local baseline observed on 2026-07-27:

```text
bun test --preload ./test/setup.ts test/markdownRendering.test.tsx
22 pass, 0 fail

bun x tsc --noEmit -p tsconfig.json
passed

bun run build
passed
```

## Email-Client Research

Compatibility percentages are broad Caniemail estimates, not guarantees for this exact markup or future client releases.

| Option | Evidence | Decision |
| --- | --- | --- |
| Native compact table that fits at every width | The `<table>` element is reported as 100% supported. Width, borders, padding, and pixel typography are established email primitives. | Recommended for intrinsically narrow data. |
| `table-layout: fixed` | Estimated support is 54.84%. It helps equal-width wrapping where honored, but cannot be the only safeguard. Some clients impose their own table algorithm. | Retain inline as useful behavior; rely on content shape, not the property alone. |
| Horizontal scrolling wrapper with `overflow-x: auto` | General `overflow` has broad reported support only when partial support is counted, but current Caniemail notes say content can be impossible to scroll in Gmail Android, Outlook Android, Yahoo Android, AOL Android, Proton Android, and others. Classic Outlook Windows does not provide a dependable scrolling fallback. | Reject as required behavior. It may clip the information it is meant to preserve. |
| Media-query stacking or column hiding | `@media` is estimated at 80.48% including partial support. It is absent in classic Outlook Windows and account-dependent in Gmail mobile; Yahoo and other clients have query/head caveats. It also requires selectors to target generated descendants. | Reject as a baseline. Do not hide fields or switch table cells to blocks this way. |
| Always setting `tr`, `th`, or `td` to `display:block` | It avoids a media query but destroys the desktop grid everywhere. Classic Outlook Windows only supports limited `display` behavior, and stacked values need repeated labels or `data-label` content that the current style map cannot generate. | Reject. |
| Duplicate desktop table and mobile list with visibility toggles | Requires media queries, `display:none`, or client-specific conditional markup. Classic Outlook has nested-table `display:none` bugs. Duplicate content is risky for screen readers, forwarding, search, plain text, and clients that expose both versions. | Reject. |
| CSS pseudo-element labels such as `td::before` | Requires generated content, attributes, and structural selectors. The built-in renderer cannot add the needed `data-label` attributes, and pseudo-element/selectors are not a dependable email baseline. | Reject. |
| Fluid-hybrid inline-block cards | Can stack some layout columns without media queries, but robust desktop Outlook support requires ghost tables and specialized markup. Applying it to arbitrary data requires a custom renderer, repeats headers, and weakens table semantics. | Not proportionate for `markdownV1`; reconsider only with a new renderer and client-funded requirement. |
| `word-break` or `overflow-wrap` as the solution | `word-break` is estimated at 65.86% including many buggy implementations. `overflow-wrap` is estimated at 22.58%; classic Outlook Windows is unsupported. | Progressive guard only. Do not permit long tokens because a wrapping declaration exists. |
| Image of a table | Visually predictable but inaccessible, often scaled to unreadable text, affected by image blocking, not searchable/selectable, and absent from plain text. | Reject. |
| Link to a web-hosted full table | Useful for optional detail but not for essential email content and does not repair the in-message summary. | Optional supplement only. |
| Select table versus bullet/key-value form by content shape | Requires no viewport detection or new parser. It uses only the currently approved trusted Markdown syntax and survives removal of all style blocks. | Recommended. |

Litmus describes both media-query stacking and a more code-heavy fluid-hybrid layout. Its examples concern hand-authored layout columns, use specialized markup and Outlook ghost tables, and note accessibility/order tradeoffs. They are not a drop-in transformation for `@react-email/markdown` data tables. The useful lesson for this project is that a single-column mobile baseline is safest when query support cannot be assumed.

## Target Authoring Contract

The future contract should say:

- A Markdown table has exactly one header row and at most two columns.
- Cells contain short words or short phrases with ordinary wrapping opportunities.
- Do not put bare URLs, hashes, UUIDs, account numbers, long code-like identifiers, or other unbroken values in cells.
- Use descriptive labeled links. Link destinations remain available in HTML and plain text without consuming visual table width.
- Avoid multiline cells, raw HTML breaks, images, nested tables, colspan, rowspan, and alignment-dependent meaning.
- A table's conclusion must remain understandable row by row and in the plain-text alternative.
- Use a bullet per record when a record has three or more displayed fields.
- Use a two-column `Field / Value` table when one record has several attributes and a table is materially clearer than bullets.
- Keep important conclusions in prose. Spatial table alignment is not guaranteed in plain text or assistive technology.

The maximum two-column rule is authoring policy under the existing trusted model, just like the approved syntax list. Built-in Markdown does not enforce it. Do not introduce a regex table validator: escaped pipes, inline links, code-like text, and Marked parsing rules make source regexes an unsafe substitute for tokens. If technical enforcement becomes mandatory, move table parsing to a constrained token/AST renderer in a separately versioned design.

## Expected Output Behavior

### Retained Two-Column Table

Input:

```md
| Plan | Status |
| --- | --- |
| Pro | Active |
| Team | [Pending review](https://example.com/team) |
```

Representative target HTML shape:

```html
<table style="width:100%;table-layout:fixed;border-collapse:collapse;background-color:#ffffff;margin:8px 0 16px">
  <thead style="background-color:#f9fafb;font-weight:600;color:#000000">
    <tr style="vertical-align:top">
      <th style="padding:8px 6px;border:1px solid #eaeaea;font-size:16px;line-height:22px;text-align:left;color:#000000;word-break:normal;overflow-wrap:break-word">Plan</th>
      <th style="padding:8px 6px;border:1px solid #eaeaea;font-size:16px;line-height:22px;text-align:left;color:#000000;word-break:normal;overflow-wrap:break-word">Status</th>
    </tr>
  </thead>
  <tbody style="background-color:#ffffff">
    <tr style="vertical-align:top">
      <td style="padding:8px 6px;border:1px solid #eaeaea;font-size:16px;line-height:22px;text-align:left;color:#000000;word-break:normal;overflow-wrap:break-word">Team</td>
      <td style="padding:8px 6px;border:1px solid #eaeaea;font-size:16px;line-height:22px;text-align:left;color:#000000;word-break:normal;overflow-wrap:break-word">
        <a href="https://example.com/team" target="_blank" style="color:#155dfc;text-decoration:none">Pending review</a>
      </td>
    </tr>
  </tbody>
</table>
```

Exact serialization order may vary. Required behavior is direct styles on every table/cell, a true table on desktop, natural wrapping at spaces on narrow clients, and inherited 16 px/22 px link typography inside cells. Ignoring `table-layout` or `overflow-wrap` must leave the approved fixture understandable.

Expected plain text remains table-oriented through the existing formatter, for example:

```text
PLAN   STATUS
Pro    Active
Team   Pending review [https://example.com/team]
```

Whitespace and header casing are controlled by the installed `html-to-text` formatter and should be pinned to observed output rather than this illustrative spacing.

### Wide-Record Alternative

Input:

```md
- **Pro:** Active; Engineering; [Details](https://example.com/pro)
- **Team:** Pending; Sales; [Details](https://example.com/team)
```

Representative target HTML behavior:

```html
<ul style="list-style-type:disc;padding-left:24px;margin:16px 0 4px">
  <li style="font-size:18px;line-height:28px;margin:0 0 4px;color:#000000">
    <strong style="font-weight:600">Pro:</strong>
    Active; Engineering;
    <a href="https://example.com/pro" target="_blank" style="color:#155dfc;text-decoration:none">Details</a>
  </li>
</ul>
```

It remains a single fluid text column on desktop and mobile. Its plain text naturally retains record order and link destinations. No duplicate representation or visibility rule is emitted.

## Exact Future File Locations

Primary behavior files:

- `src/template_parts/TrustedMarkdownContent.tsx`: compact cell styles, context-inheriting link typography, and trust/authoring comments.
- `src/templates/markdown/MarkdownV1Template.tsx`: representative two-column table and wide-record bullet alternative in `PreviewProps`.
- `test/markdownRendering.test.tsx`: exact rendered-style, inherited-link, retained-table, bullet-fallback, plain-text, and size regressions.
- `test/apiMarkdown.test.ts`: API fixture aligned with the supported authoring profile.

Contract and documentation files:

- `README.md`: replace the four-column guidance with the two-column intrinsic table contract and wide-record alternatives.
- `src/server/schemas/markdownV1Schema.ts`: update the OpenAPI-facing trusted Markdown description if it currently implies unrestricted tables. Do not claim runtime column enforcement.
- `docs/20260727_trusted_markdown_table_email_implementation_plan.md`: do not rewrite historical decisions; add a short superseded-guidance pointer only if the project maintains plan status cross-links.

Preview and release evidence:

- `src/templates/emailTemplateScreenshot.ts`: no code change should be necessary; use its existing `markdownV1` mapping when regenerating preview evidence.
- Hosted/generated `markdownV1.jpg`: refresh only after desktop and narrow inbox validation, if screenshots are release artifacts in the normal image workflow.

Files that should not change for this follow-up:

- `client/types/MarkdownV1Type.ts`: no new API field is needed.
- `src/server/render/renderMarkdownV1.tsx`: retain the scoped `dataTable` formatter.
- `src/server/api/apiRouteDef.ts`: retain authentication and request-byte limits.
- `src/server/routes/addRoutesTemplates.ts`: retain the existing trust and validation boundary.
- `package.json` and `bun.lock`: add no responsive-table or Markdown dependency.
- `dist/`: regenerate only through `bun run build` if public client sources change; no client change is expected.

## Independently Verifiable Implementation Subtasks

### 1. Pin The Current Failure Fixture

Before changing styles, preserve a temporary render fixture for the current four-column example and capture desktop plus 320 px screenshots. Record the available inner width, wrapping, overflow, and effective cell text size in at least one browser preview and one real mobile client.

Verification:

- The evidence demonstrates why string assertions for `width:100%` and `table-layout:fixed` are insufficient.
- No production behavior changes in this subtask.

### 2. Make Link Typography Contextual

In `src/template_parts/TrustedMarkdownContent.tsx`, retain direct inline link color and decoration but remove the global 18 px font size and 28 px line height. Parent paragraphs, list items, and cells already own direct typography.

Verification in `test/markdownRendering.test.tsx`:

- A paragraph link visually inherits 18 px/28 px from its directly styled `<p>`.
- A list link inherits 18 px/28 px from its directly styled `<li>`.
- A table link inherits 16 px/22 px from its directly styled `<td>`.
- Every anchor still has the required direct literal color and decoration.
- No descendant selector or media query is introduced.

### 3. Apply The Compact Intrinsic Table Baseline

Change only the shared table cell declaration in `src/template_parts/TrustedMarkdownContent.tsx` to 16 px/22 px and `8px 6px` padding. Keep width, fixed layout, collapsed borders, direct colors, and top alignment. Add `word-break: normal` and `overflow-wrap: break-word` only as inline progressive protection; comments and tests must state that authored breakability remains required.

Verification:

- Both `<th>` and `<td>` receive the complete compact declaration under installed version `0.0.18`.
- Removing every `<style>` block leaves the table styled and readable.
- The two-column fixture remains within the main container at 320 px without horizontal scrolling.
- The table remains a native table at desktop width.
- Ignoring `overflow-wrap` in devtools does not break the approved short-content fixture.

### 4. Replace The Supported Four-Column Fixture

Update `MarkdownV1Template.PreviewProps` and shared test fixtures to contain both one valid two-column table and one list-based wide-record example. Keep all other approved syntax represented.

Verification:

- Preview visibly demonstrates when to use each form.
- Supported fixtures contain no table with more than two columns.
- Existing bold/link/list/table paths all remain exercised.
- No raw HTML, custom class, or author-supplied style is required.

### 5. Update Render And Plain-Text Tests

Refactor the table-specific assertions in `test/markdownRendering.test.tsx` into independently named cases for table structure, compact styles, contextual links, natural break opportunities, bullet fallback, and plain text.

Retain a maximum-output regression. Recalculate it against the maximum approved two-column fixture, but also keep an explicitly named out-of-contract stress case if four-column source remains accepted by the trusted parser. Do not imply that the schema enforces column count.

Verification:

```bash
bun test --preload ./test/setup.ts test/markdownRendering.test.tsx
```

Acceptance points:

- Retained tables still use the scoped plain-text data formatter.
- Bullet alternatives do not pass through the table formatter.
- Shell/layout tables remain absent from data-table text output.
- Maximum approved output remains below the existing 90 KiB pre-send budget.

### 6. Align API Fixture And Documentation

Update `test/apiMarkdown.test.ts`, `README.md`, and the schema description in `src/server/schemas/markdownV1Schema.ts`. Describe the two-column limit as a trusted-author contract, not runtime validation. Include the bullet and transpose alternatives for wider records.

Verification:

- OpenAPI still reports the same request shape and bounds.
- API tests still cover a real table and the wide-record alternative.
- No claim says unsafe raw HTML or unsupported table shape is technically rejected.

### 7. Run Preview And Runtime E2E

Render the same fixture through React Email preview, Bun, and workerd. Inspect the actual response HTML and text rather than only the preview DOM.

Verification commands:

```bash
bun run dev:email
bun run dev:bun
bun run dev:worker
```

Bun request example:

```bash
curl --fail-with-body -sS http://localhost:3055/renderEmailTemplate/markdownV1 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer dev-only' \
  --data-binary '{"subject":"Plan update","markdown":"| Plan | Status |\n| --- | --- |\n| Pro | Active |\n| Team | Pending review |\n\n- **Pro:** Active; Engineering; [Details](https://example.com/pro)","homepageText":"example.com","homepageUrl":"https://example.com","hompageSubtitle":"Excellency by design"}'
```

Repeat against `http://localhost:8787` with the Worker token configuration. Confirm HTML, plain text, 200 response shape, bearer behavior, and `Cache-Control: no-store` remain identical in intent.

### 8. Complete Narrow-Client Inbox Validation

Use a real inbox service or physical devices; browser responsive mode is only an early check. Test at least:

- Gmail web and Gmail iOS/Android with a Google account.
- Gmail mobile with a non-Google account if recipients use that path.
- Apple Mail macOS and iOS.
- Outlook.com or new Outlook.
- Classic Outlook Windows if it remains a supported target.
- Outlook iOS/Android.
- Yahoo Android if it remains a supported target.

For each result, record client variant, account type, OS, viewport/device, text scaling, normal/dark mode, and whether remote content or styles were blocked.

Fixtures must include:

- Two short columns.
- A labeled link that wraps at a space.
- Long localized but breakable phrases.
- One deliberately long unbroken token to observe acceptable progressive degradation; it is not an approved authoring example.
- The bullet alternative for a four-field record.
- The maximum approved source/output fixture.

Release gate:

- No approved table requires horizontal panning.
- Text remains comfortably readable without zoom.
- Header/body association remains understandable after wrapping.
- The main email shell does not expand wider than the message viewport.
- The bullet alternative is readable and complete in every client.

## Full Validation Commands

```bash
bun x biome check client src test package.json tsconfig.json tsconfig.lib.json biome.json
bun x tsc --noEmit -p tsconfig.json
bun run test
bun run build
bun x wrangler deploy --dry-run --config wrangler.example.toml
```

Also record rendered byte counts for representative and maximum fixtures. Compact cell styles reduce repeated HTML slightly, but adding wrapping declarations to every cell increases it; measure the final result rather than assuming the change is size-neutral.

## Gotchas And Escalation Triggers

- A wide desktop grid cannot become a labeled mobile stack without either viewport-dependent CSS, duplicated content, or renderer-level structural transformation. This plan deliberately changes the authoring choice instead of hiding that constraint.
- `table-layout: fixed` is useful but not universally honored. Short, breakable content is the baseline.
- `overflow-wrap` and `word-break` cannot make arbitrary identifiers safe in every client. Classic Outlook Windows remains a key failure case.
- Shrinking text is not responsiveness. Do not go below the proposed 16 px table baseline merely to keep extra columns.
- The installed Markdown renderer's `td`-for-`th` quirk remains. A dependency upgrade may start reading `th`; retain complete intent in both map entries and review normalized output after upgrades.
- Removing font dimensions from the link map intentionally uses inheritance from a directly styled parent. Test links in every supported parent context. Raw HTML anchors outside mapped parents do not receive this guarantee.
- Built-in Markdown emits real `<th>` tags but cannot add `scope="col"`. Simple one-header-row tables have the best chance of useful inference, but exact assistive-technology behavior requires inbox/screen-reader testing. More complex accessibility semantics require a custom renderer.
- Do not add `role="presentation"` to Markdown data tables. That role is for layout tables and would erase data-table semantics.
- The direct-child plain-text selector depends on the current `data-id` and table nesting. React Email upgrades can change it.
- The 1,000-character limit bounds source, not rendered complexity. Inline styles repeat per cell. A trusted author can still accidentally create out-of-contract high-column tables because syntax policy is not schema-enforced.
- Do not parse GFM tables with line-splitting or regular expressions to enforce columns. Escapes, links, and parser rules make that brittle.
- Do not add a caller option such as `responsiveTableMode`; a server cannot know the recipient's viewport and a mode flag does not solve client support.
- Do not use raw HTML inside trusted Markdown to hand-author responsive tables. It bypasses mapped styles, spreads email markup into content, and makes review and tests harder.
- Forwarding and reply quoting can alter widths and CSS even in clients that render the original message correctly. Include one forward/reply check for table-heavy production mail.
- Large-text accessibility settings can make even two columns too narrow. The bullet alternative remains the preferred form when cell values are verbose.
- If product requirements insist on arbitrary three/four-column desktop tables plus a distinct narrow presentation, create a versioned custom token/AST renderer. It must emit both representations with a documented accessibility strategy or emit a single structurally transformed representation. That is a separate architecture decision, not a style-map patch.
- Move to a constrained AST renderer before accepting untrusted/CMS/webhook content, technically enforcing column/token limits, sanitizing raw HTML, validating URL protocols, adding `scope`/caption semantics, or mapping tables to project components.

## Acceptance Criteria

- `markdownV1` keeps the current trusted-author, bearer-protected, built-in React Email Markdown architecture.
- No media query, descendant/child/sibling selector, pseudo-element, overflow scroller, visibility toggle, flexbox, grid, or duplicated mobile table is required for readability.
- Supported tables have at most two columns and remain real tables on desktop and narrow clients.
- Wider records use ordinary approved Markdown bullets or a two-column transpose.
- Retained cells have direct 16 px/22 px typography, compact direct padding, borders, literal colors, and top alignment.
- Links inherit the typography of their directly styled paragraph, list item, or cell while retaining direct color and decoration.
- Approved fixtures fit and remain understandable at 320 px and with enlarged text without horizontal panning.
- HTML remains legible after all `<style>` blocks are removed.
- Plain text retains table rows for true tables, readable records for bullets, link destinations, content order, and footer text.
- Existing auth, validation, no-store, response, source/body limit, client import, OpenAPI, Bun, Worker, and output-size behavior remains intact.
- Required browser preview, real inbox, dark mode, text scaling, forwarding, and maximum-output evidence is recorded before release.

## Sources

Primary implementation sources:

- React Email Markdown API and overriding style behavior: https://react.email/docs/components/markdown
- Installed Markdown implementation: `node_modules/@react-email/markdown/dist/index.mjs`
- Installed Markdown package/version: `node_modules/@react-email/markdown/package.json`
- Marked token and renderer extension model, relevant only to the future custom-renderer escalation: https://marked.js.org/using_pro

Email compatibility evidence:

- Native table element: https://www.caniemail.com/features/html-table/
- `table-layout`: https://www.caniemail.com/features/css-table-layout/
- `overflow`: https://www.caniemail.com/features/css-overflow/
- `word-break`: https://www.caniemail.com/features/css-word-break/
- `overflow-wrap`: https://www.caniemail.com/features/css-overflow-wrap/
- Media queries: https://www.caniemail.com/features/css-at-media/
- `display`: https://www.caniemail.com/features/css-display/
- `role` attribute support and caveats: https://www.caniemail.com/features/html-role/
- Litmus responsive stacking and fluid-hybrid tradeoffs: https://www.litmus.com/blog/mobile-responsive-email-stacking

## Review Outcome Template

```text
Intrinsic two-column table maximum approved: yes / changes: ...
Wide records use bullets or two-column transpose: yes / changes: ...
Compact table size approved: 16px / 22px / 8px 6px / changes: ...
Context-inheriting link typography approved: yes / no
overflow-wrap treated only as progressive protection: yes / no
No required media queries/selectors/scrollers/duplicate variants: yes / no
Classic Outlook Windows release blocker: yes / no
Gmail non-Google mobile path required: yes / no
Yahoo Android required: yes / no
320px and enlarged-text release evidence recorded at: ...
Maximum rendered HTML bytes: ...
Future AST migration triggers approved: yes / changes: ...
```
