# CSS-Only Responsive HTML Email Table Research Plan

Date: 2026-07-27
Status: Repository assessment, online research, and follow-on plan only. No product code, README, or tests are changed by this document.

## Exact Conclusion

> No CSS-only technique can honestly guarantee a readable arbitrary four-column desktop data table on narrow screens across Gmail, classic Outlook for Windows, Outlook web/mobile, and Apple Mail/iOS. For `markdownV1`, keep native compact tables only for intrinsically narrow data (at most two short, breakable columns); author records with three or more fields as bullets or a two-column key/value transpose, optionally linking to a full web table. If an out-of-contract four-column table is supplied, the non-supporting-client fallback is the same compact native table with ordinary wrapping, and it must be documented as potentially cramped or overflowing, not as mobile-supported.

This conclusion is intentionally narrower than “responsive tables are impossible in email.” A media-query card transformation can be a useful progressive enhancement in some clients if the HTML already contains targeting hooks and repeated labels. It is not a complete solution for the required client matrix, and the current built-in Markdown renderer does not emit the structure needed to make arbitrary records into understandable cards.

## Recommended Behavior

1. Keep real tables for no more than two columns, one header row, short breakable values, and labeled links.
2. Keep the current direct inline baseline: `width:100%`, compact 16 px/22 px cells, `8px 6px` padding, borders, top alignment, and natural wrapping. Treat `table-layout:fixed`, `overflow-wrap`, and `word-break` as progressive aids, not guarantees.
3. Represent records with three or more displayed fields as a fluid bullet per record or transpose one record into a two-column `Field / Value` table.
4. Put important conclusions in prose or bullets. A link to a full web table can supplement, but not replace, essential in-message information.
5. Do not shrink table text below 16 px merely to retain four columns.
6. Do not require media queries, `display:block`, pseudo-element labels, horizontal scrolling, hidden columns, or duplicated mobile content for the supported baseline.

Fallback for clients that remove or ignore head CSS is therefore deliberate and complete: directly styled native two-column tables and ordinary single-column text/list content remain readable. An out-of-contract four-column table still renders because the trusted parser does not enforce the authoring policy, but it receives no claim of narrow-client readability.

If preserving a four-column desktop grid becomes non-negotiable, create a separately reviewed renderer/content model that can emit classes, repeated labels, caption/scope semantics, and a tested fallback. Even then, use a card transformation only as progressive enhancement. Non-supporting clients need an always-readable summary outside the table; CSS alone cannot provide one from arbitrary table headings.

## Scope And Terminology

This assessment uses **CSS-only** to mean no JavaScript executes in the inbox. That still leaves two materially different categories:

- **Styling the existing output:** CSS may only act on the native tags currently emitted by `@react-email/markdown`.
- **Purpose-built HTML plus CSS:** a renderer may pre-emit classes, `data-label` values, duplicate labels, wrappers, or alternate markup, after which CSS changes presentation.

Many web articles call the second category “CSS-only” because no browser JavaScript is required. That does not make it a CSS-only fix for this project: the missing labels and wrappers must first be generated in product code, and email-client CSS support still determines whether the transformation runs.

## Current MarkdownV1 Output

### Render Path

- `src/templates/markdown/MarkdownV1Template.tsx` places one escaped React Email `Heading` and `TrustedMarkdownContent` inside `EmailLayout`.
- `src/template_parts/EmailLayout.tsx` emits `Html`, `Head`, `Preview`, `Tailwind`, a padded 600 px maximum content container, and the shared footer.
- `src/template_parts/TrustedMarkdownContent.tsx` owns the complete Markdown style map. Critical Markdown styles are direct inline values; it deliberately uses no media queries, descendant selectors, CSS variables, or duplicate content.
- `src/server/render/renderMarkdownV1.tsx` renders HTML once and converts only direct Markdown tables to plain text with `[data-id=react-email-markdown]>table` and the `dataTable` formatter.

The installed `@react-email/markdown` `0.0.18` renderer produces this structural shape:

```html
<div data-id="react-email-markdown" style="font-family:...;color:#000000">
  <table style="width:100%;table-layout:fixed;border-collapse:collapse;...">
    <thead>...</thead>
    <tbody>
      <tr>
        <td style="padding:8px 6px;font-size:16px;line-height:22px;...">...</td>
      </tr>
    </tbody>
  </table>
</div>
```

Relevant installed-version constraints:

- The component API accepts only Markdown text, wrapper styles, and per-element inline style maps.
- It emits no table-specific wrapper, class, caption, `scope`, cell `data-label`, or repeated heading text.
- It offers no custom table renderer or viewport-specific hook.
- It applies the `td` style map to both `<th>` and `<td>` in version `0.0.18`.
- The wrapper has `data-id="react-email-markdown"`, so manually authored head CSS could target descendants, but that would introduce the exact style-block, selector, and media-query dependency the current baseline avoids.
- React Email's `markdownCustomStyles` can only serialize inline declarations. An inline declaration cannot contain an `@media` rule or target another generated element.

### Current Table Contract

Current code and current examples already implement the later intrinsic-table direction:

- `TrustedMarkdownContent.tsx` says at most two columns with short breakable content.
- `MarkdownV1Template.tsx`, `test/markdownRendering.test.tsx`, and `test/apiMarkdown.test.ts` use a supported two-column table plus bullet-based wide records.
- Cells use 16 px/22 px typography, `8px 6px` padding, `word-break:normal`, and `overflow-wrap:break-word`.
- Links inherit typography from their directly styled parent, so table links remain 16 px while paragraph/list links remain 18 px.
- Tests explicitly retain native table markup and prohibit `display:block` on cells.
- Four-column Markdown is accepted only as an explicitly out-of-contract parser/stress case.

### Documentation Drift

- `README.md` still says tables may have at most four columns.
- The README says the 1,000-character limit keeps the worst compact four-column table below 90 KiB; the current test run disproves that statement.
- `docs/20260727_trusted_markdown_table_email_implementation_plan.md` records the historical four-column direction and an earlier size measurement.
- `docs/20260727_markdown_v1_narrow_client_table_readability_followup_plan.md` supersedes that table-width recommendation and matches current code: two columns for tables, bullets/key-value forms for wider records.
- Historical plans should remain historical records, but user-facing guidance and active schema descriptions should align with the current two-column authoring contract.

## Current Test Baseline

Observed with `bun run test` on 2026-07-28:

```text
62 pass
2 fail
235 expect() calls
64 tests across 9 files
```

The server started and shut down normally. The two failures are assertions, not a hanging test process:

1. `test/markdownRendering.test.tsx:94`, “links have direct inline color and text-decoration but no font-size.” The test collects every styled `<a>` in the complete email. It therefore includes `Footer.tsx`'s intentionally styled `text-xl font-extrabold` homepage link (`font-size:1.25rem;line-height:1.4`) and falsely treats it as a Markdown link. The test should scope anchor inspection to the `data-id="react-email-markdown"` region rather than weakening the Markdown requirement or changing the footer.
2. `test/markdownRendering.test.tsx:410`, “maximum compact four-column stress table remains below 90 KiB.” Current output is 118,202 bytes versus the asserted `< 92,160` bytes. The approved two-column maximum test passes. The four-column case is explicitly out of contract, so the follow-up decision must either remove the unsupported 90 KiB promise for that case or lower/enforce a bound that actually guarantees it. Raising the limit would conflict with the existing pre-send/Gmail headroom rationale and should not be the default repair.

No tests measure a real inbox's narrow layout. String assertions for `width:100%`, wrapping declarations, and native tags cannot prove that four columns remain readable at 320 px, with text scaling, or in a narrow Outlook reading pane.

## Generic Web Advice Versus Email Guidance

| Common advice | Generic web viability | HTML email assessment |
| --- | --- | --- |
| Put the table in an `overflow:auto` region | Common web baseline; Adrian Roselli recommends an accessible focusable region around the table. | Not a dependable email baseline. Inbox JavaScript is unavailable, focus/ARIA behavior varies, classic Outlook Windows does not support overflow, and current Gmail/Outlook Android results can hide content that cannot be scrolled. MarkdownV1 also emits no per-table wrapper. |
| At a breakpoint, set table elements to `display:block` | Common CSS-only browser pattern. | Progressive only. It depends on retained head CSS, media queries, selectors, and `display:block`; classic Outlook Windows supports only `display:none`, and Gmail mobile media queries are account-dependent. |
| Add labels with `td::before { content: attr(data-label) }` | Common card-table pattern when HTML contains `data-label`. | Not available in current output. Gmail officially promises class, element, and ID selectors rather than pseudo-elements; attribute selector support is partial; generated content cannot be assumed; the Markdown renderer emits no label attributes. |
| Hide the header and repeat labels in cards | Can work in purpose-built web markup. | A CSS-only transform cannot copy arbitrary `<th>` text into each cell. Hard-coded `nth-child` labels are content-specific, localization-sensitive, selector-dependent, and unavailable through the current style map. |
| Keep the native table and horizontally scroll it | Often the least destructive browser choice for table semantics. | Rejected as required email behavior because scroll can be unavailable or undiscoverable and hidden content can become unreachable. |
| Use fluid-hybrid inline-block columns | Established no-query email layout technique. | Useful for hand-authored layout modules, not a drop-in data-table transformation. It requires specialized markup and Outlook ghost tables, repeats semantic context, and the current Markdown renderer cannot emit it. |
| Reduce font size and padding | Safe browser and email CSS when values are conservative. | Useful only as bounded compression. It cannot create enough readable width for arbitrary four-column data; shrinking below 16 px trades overflow for illegibility. |
| Hide low-priority columns | Straightforward responsive web option. | Reject for this contract. CSS support varies, removed fields may be essential, and plain-text/forwarding/accessibility behavior no longer matches the visible message. |

CSS-Tricks' well-known card pattern explicitly “force[s] the table to not behave like a table,” hides the header off-screen, and inserts hard-coded labels with pseudo-elements. Adrian Roselli documents that changing table display roles can remove table semantics from browser accessibility APIs. Those are useful web cautions, not proof that the pattern works in email.

Litmus' email stacking guidance concerns layout columns. Its media-query method adds classes to hand-authored cells, while its hybrid method uses inline-block `<div>` elements plus conditional Outlook ghost tables and notes code/accessibility tradeoffs. Neither method derives a labeled record card from arbitrary Markdown data-table output.

## Client Evidence

Caniemail percentages are weighted estimates based on a changing set of tested clients. They are evidence, not guarantees for this message. Test dates also vary by feature, so real-inbox release tests remain necessary.

### Media-Query Table-To-Block Or Card Transformation

Required chain: retained `<style>` element + supported `@media` query + selector matching + supported `display:block` + labels that survive the transformation.

| Client family | Evidence | Viability |
| --- | --- | --- |
| Gmail web | Google officially documents class/element/ID selectors, `display`, and width media queries. Caniemail reports partial `@media` support because nested and height queries are limited. | Technically plausible with simple head CSS and purpose-built hooks; still not available from the current inline-only table style map. |
| Gmail iOS/Android | Caniemail reports width media queries but explicitly says they are unsupported for non-Google accounts. `display` is broadly available, with limitations for modern values rather than ordinary block. | Progressive enhancement for Google-account rendering only. A non-Google account can receive the unchanged four-column narrow table, so this cannot be the baseline. |
| Classic Outlook Windows | Caniemail reports no media-query support for Outlook 2007-2019 and says `display` only supports `none` (with nested-table bugs), not `block`. | Transformation does not run. A wide desktop table is an acceptable fallback only when the reading pane is actually wide; it does not solve narrow panes or enlarged text. |
| Outlook.com/new Outlook and Outlook iOS/Android | Caniemail reports partial media-query support (nested queries removed/unsupported) and `display` support. | A simple progressive stack is plausible after real-client testing. It still needs labels/markup not emitted by MarkdownV1. Passing these clients does not cover classic Windows Outlook. |
| Apple Mail macOS/iOS | Caniemail reports media-query and `display` support. | Best candidate for the transform, but success here does not establish cross-client support. Display changes can also affect table semantics, so VoiceOver testing is required. |

Decision: **Do not use as the supported baseline.** A future purpose-built renderer may trial it as progressive enhancement, with a native/summary fallback that remains complete when every head style is removed.

### CSS Stacking Without Media Queries

Always applying `display:block` to `table`, `tr`, `th`, or `td` removes the four-column desktop grid, directly violating the requirement. Applying inline-block/fluid-hybrid behavior to newly generated record modules can produce desktop columns that wrap on smaller widths, but it is a different HTML structure, not the original semantic table.

- Gmail, Outlook web/mobile, and Apple Mail can render basic `display` values.
- Classic Outlook Windows only supports `display:none` according to Caniemail, so robust fluid-hybrid email layouts use conditional ghost tables.
- Litmus states that the hybrid approach is more code-heavy and can produce screen-reader ordering tradeoffs.
- Current MarkdownV1 cannot emit inline-block record wrappers, ghost tables, repeated labels, or conditional Outlook markup.

Decision: **Not a CSS-only fix for MarkdownV1 and not suitable for arbitrary data tables.** Consider only as a custom, versioned record/card component, not by mutating table display roles.

### Horizontal Scrolling

The strongest generic-web recommendation is a focusable wrapper with `overflow:auto`, preserving the native table. Email support breaks the required fallback:

| Client family | Caniemail overflow evidence | Viability |
| --- | --- | --- |
| Gmail web/iOS | Supported in tested paths; newer results are partial only for logical overflow properties. | Plausible, but scroll affordance and inbox focus behavior still need testing. |
| Gmail Android | The July 2025 result is buggy: content can be hidden but impossible to scroll. | Reject as required behavior. |
| Classic Outlook Windows | `overflow` is not supported in tested 2013-2024 versions. | No scrolling containment; table may expand or clip. |
| Outlook.com/new Outlook and iOS | Supported/partial in current results. | Plausible progressive behavior. |
| Outlook Android | May 2025 result is buggy: cannot scroll through hidden content. | Reject as required behavior. |
| Apple Mail/iOS | iOS supports overflow; modern macOS is partial only for logical properties, while an older macOS test could not scroll hidden content. | Better than Android/Windows Outlook, but not sufficient for the matrix. |

Current MarkdownV1 has an outer wrapper around all Markdown but no wrapper around each table. Applying overflow to the whole Markdown section would create the wrong scroll region; applying it directly to `<table>` is not equivalent to a dedicated scrolling container and depends on changing table display behavior.

Decision: **Reject as baseline and do not hide essential data behind it.** A web-hosted full table may use this browser pattern; the email summary should not.

### Typography, Padding, And Compression

This is the only technique that is both current and broadly email-compatible:

- Native `<table>` is reported as 100% supported.
- `width` and padding are broadly supported; classic Outlook's padding support is strongest on table cells, which matches this use.
- Pixel font sizes avoid classic Outlook's lack of `rem` support.
- The current 16 px/22 px and `8px 6px` baseline is a reasonable floor, not excess spacing.
- `table-layout:fixed` is only 54.84% supported overall. It works in the tested Gmail, Apple, Outlook web/mobile paths, but not classic Outlook Windows; Outlook for macOS 16.80 forces fixed layout independently.
- `word-break` has 65.86% support including buggy behavior, and `overflow-wrap` has 22.58%; classic Outlook Windows supports neither in the cited tests. Authored natural break points remain mandatory.

At a nominal 320 px viewport, body/container padding and borders leave materially less than 320 px for content. Four equal columns can be around 65-70 px before cell padding. At 16 px text, this is enough only for unusually short values and produces tall, fragmented rows as content wraps. Font/padding compression therefore improves a narrow table that already fits; it does not make arbitrary four-column data responsive.

Decision: **Keep for two columns; reject as proof of four-column narrow readability.** Do not reduce typography below the current floor.

### Column Hiding, Reordering, And Duplicate Variants

- Hiding columns solves width by dropping information, not by making the table readable.
- Reordering/hiding requires head CSS and selectors, and its meaning can diverge from HTML/plain text.
- Sending a desktop table plus mobile cards requires duplicate content and visibility toggles. Caniemail reports classic Outlook nested-table `display:none` bugs, so both copies can leak.
- Duplicate variants increase rendered size in a service already enforcing a 90 KiB pre-send target and can duplicate content for screen readers, search, forwarding, and plain-text conversion.

Decision: **Reject.** If a future product deliberately sends two representations, it is a renderer/content architecture decision with explicit accessibility and size acceptance, not a CSS-only patch.

## Technique Decision Matrix

| Technique | Preserve four-column desktop grid | Readable on narrow supporting clients | Safe fallback across required matrix | Works with current MarkdownV1 output | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| Native compact table + natural wrapping | Yes | Only for exceptionally short four-column content | Structure survives, readability not guaranteed | Yes | Supported only up to two columns |
| Media-query `display:block` cards | Yes | Potentially | No: Gmail non-Google path and classic Outlook Windows | No labels/hooks | Progressive future experiment only |
| Pseudo-element/data-label cards | Yes | Potentially | No reliable selector/generated-content baseline | No `data-label` output | Reject for current renderer |
| Always-stacked block cells | No | Yes | Classic Outlook `display` limitation | Could be inline but destroys desktop | Reject |
| Fluid-hybrid inline-block cards | Can imitate columns | Yes | Needs ghost tables and specialized markup | No | Separate custom component only |
| Horizontal overflow wrapper | Yes | Only where scrolling works | No: Gmail Android, Outlook Android, classic Outlook Windows | No per-table wrapper | Reject as baseline |
| Hide low-priority columns | Superficially | Yes, with data loss | No | No classes; loses content | Reject |
| Duplicate desktop/mobile representations | Yes | Potentially | Visibility and duplication failures | No | Reject by default |
| Smaller type/padding | Yes | Limited | Yes for the declarations, not the outcome | Already implemented | Keep current floor; not a solution |
| Two-column table or bullet/key-value source form | Uses four-column grid only when author chooses an external detail view | Yes | Yes | Yes | Recommended |

## Why There Is No Honest CSS-Only Four-Column Guarantee

A complete narrow card needs each value associated with its header. CSS cannot read arbitrary `<th>` text and inject it into every corresponding `<td>`. It must receive labels from one of these non-CSS sources:

- repeated visible label elements;
- `data-label` attributes generated by the renderer;
- hard-coded content-specific CSS strings;
- duplicate mobile markup; or
- JavaScript, which is not an email option.

Even with labels pre-generated, the CSS transformation depends on media-query, style-element, selector, and display support. The required matrix contains a genuinely narrow failure path: Gmail mobile with non-Google accounts. Classic Outlook Windows also ignores the transformation; although normally desktop-width, narrow reading panes, zoom, and forwarded/quoted layouts prevent treating that as a universal success.

Horizontal scrolling preserves structure but fails because some current Android clients can hide content without allowing the user to reach it, and classic Outlook does not implement overflow. Compression preserves structure but cannot preserve both four columns and comfortable type for arbitrary values.

The requirement set is therefore over-constrained: **preserve an arbitrary four-column desktop grid + transform only when narrow + use CSS only + support every named client + guarantee readability** cannot all be true. The reliable variable to change is the authored representation, not the font size or CSS cleverness.

## Planned Follow-On Work

### 1. Align Active Documentation

- Update `README.md` from “at most 4 columns” to the trusted-author two-column rule.
- Explain bullets, two-column key/value transpose, and optional web-detail links for wider records.
- Correct the README's false claim that the maximum 1,000-character four-column table remains below 90 KiB.
- Update the active OpenAPI/schema description in `src/server/schemas/markdownV1Schema.ts` to describe the supported profile without claiming runtime column enforcement.
- Leave historical plans intact or add brief supersession pointers rather than rewriting their recorded decisions.

### 2. Fix The Markdown-Link Test

- Scope anchor collection in `test/markdownRendering.test.tsx` to the `data-id="react-email-markdown"` output.
- Continue asserting that Markdown anchors have direct color/decoration and no own font size/line height.
- Keep the footer's independent `text-xl` style unchanged.

### 3. Fix The Four-Column Size Test Honestly

- Keep the passing approved two-column maximum below 90 KiB.
- Retain a small four-column parser smoke test if useful, clearly named out of contract.
- Do not assert that a maximum 1,000-character four-column table is below 90 KiB unless the contract is changed to enforce an independently measured smaller bound.
- Do not raise the 90 KiB target merely to make the current 118,202-byte fixture pass.

### 4. Add Release Evidence Later

- Capture a supported two-column fixture and a bullet-based four-field record at 320 px and with enlarged text.
- Test Gmail web and Gmail iOS/Android with Google accounts, plus non-Google accounts if supported recipients use them.
- Test classic Outlook Windows separately from Outlook.com/new Outlook and Outlook iOS/Android.
- Test Apple Mail macOS/iOS and VoiceOver behavior.
- Record exact client, account type, OS, viewport, text scaling, and whether head styles were retained.

## Acceptance Criteria For Follow-On Changes

- Active docs no longer promise four-column mobile readability or a false four-column size bound.
- Approved tables contain at most two columns with short breakable text.
- Wide records use bullets or key/value transpose without responsive CSS.
- Removing every `<style>` block leaves supported Markdown content understandable.
- No supported behavior depends on overflow scrolling, media queries, hidden columns, pseudo-elements, or duplicate content.
- The Markdown-link test inspects only Markdown links.
- The approved maximum two-column fixture remains below 90 KiB.
- Any four-column test is explicitly out of contract and does not imply narrow-client support.
- The full suite passes without changing footer behavior.

## Sources

### Project Evidence

- `src/template_parts/TrustedMarkdownContent.tsx`
- `src/templates/markdown/MarkdownV1Template.tsx`
- `src/template_parts/EmailLayout.tsx`
- `src/template_parts/Footer.tsx`
- `src/server/render/renderMarkdownV1.tsx`
- `src/server/schemas/markdownV1Schema.ts`
- `test/markdownRendering.test.tsx`
- `test/apiMarkdown.test.ts`
- `README.md`
- `docs/20260727_markdown_v1_narrow_client_table_readability_followup_plan.md`
- `docs/20260727_trusted_markdown_table_email_implementation_plan.md`
- Installed renderer: `node_modules/@react-email/markdown/dist/index.mjs`
- Installed types: `node_modules/@react-email/markdown/dist/index.d.mts`

### Primary And Email-Specific Online Evidence

- Gmail official CSS selectors, properties, and media-query support: https://developers.google.com/gmail/design/css
- React Email Markdown API and style override behavior: https://react.email/docs/components/markdown
- Caniemail native table support: https://www.caniemail.com/features/html-table/
- Caniemail `<style>` support and Gmail/Outlook caveats: https://www.caniemail.com/features/html-style/
- Caniemail media-query support, including Gmail account and classic Outlook results: https://www.caniemail.com/features/css-at-media/
- Caniemail `display`, including classic Outlook's `display:none`-only result: https://www.caniemail.com/features/css-display/
- Caniemail overflow, including unscrollable Android and unsupported classic Outlook results: https://www.caniemail.com/features/css-overflow/
- Caniemail descendant combinator: https://www.caniemail.com/features/css-selector-descendant/
- Caniemail attribute selectors and Gmail limitations: https://www.caniemail.com/features/css-selector-attribute/
- Caniemail `table-layout`: https://www.caniemail.com/features/css-table-layout/
- Caniemail `word-break`: https://www.caniemail.com/features/css-word-break/
- Caniemail `overflow-wrap`: https://www.caniemail.com/features/css-overflow-wrap/
- Caniemail width: https://www.caniemail.com/features/css-width/
- Caniemail padding: https://www.caniemail.com/features/css-padding/
- Caniemail font size and classic Outlook unit caveat: https://www.caniemail.com/features/css-font-size/
- Litmus media-query and fluid-hybrid email stacking patterns, ghost tables, and tradeoffs: https://www.litmus.com/blog/mobile-responsive-email-stacking

### Generic Web Patterns, Not Email Compatibility Proof

- CSS-Tricks table-to-block/pseudo-label pattern: https://css-tricks.com/responsive-data-tables/
- Adrian Roselli responsive/accessibility analysis of scrolling and display-role changes: https://adrianroselli.com/2017/11/a-responsive-accessible-table.html
- Adrian Roselli's minimal accessible web overflow pattern: https://adrianroselli.com/2020/11/under-engineered-responsive-tables.html

These generic web sources explain the mechanics and accessibility costs. Client decisions in this document come from Gmail's email documentation, Caniemail's inbox tests, the email-specific Litmus pattern, and the project's actual generated markup, not from ordinary browser support.
