# Trusted Markdown Table Email Implementation Plan

Date: 2026-07-27
Status: Approved implementation direction; planning only. This document does not implement product code.

## Conversation And Decision Summary

This plan consolidates and supersedes the implementation choices left open in the four earlier plans:

- `docs/20260727_markdown_email_content_and_shared_layout_plan.md`
- `docs/20260727_react_email_vs_mjml_markdown_architecture_plan.md`
- `docs/20260727_trusted_author_react_email_markdown_architecture_plan.md`
- `docs/20260727_trusted_markdown_email_descendant_styling_followup_plan.md`

The approved feature is an additive React Email template for trusted, self-authored Markdown. Keep React Email; do not add MJML, an MJML-like compiler, `react-markdown`, an AST/component renderer, or a sanitizer for this trusted-only version. Use React Email's already installed built-in `Markdown` component. Preserve the existing `{ subject, text, html }` response, Bun server, Cloudflare Worker, React Email preview, client-only package boundary, and shared footer behavior.

The approved Markdown profile is deliberately narrow:

- Paragraphs.
- Bold text.
- Absolute URLs, including bare autolinked URLs and labeled Markdown links.
- Unordered bullet lists only.
- Simple tabular data.

Tables are now approved and are the explicit exception to the earlier plans that deferred them. Markdown headings, ordered lists, italics, strikethrough, block quotes, code, images, task controls, raw HTML, embeds, SVG, and syntax highlighting remain unsupported by contract. Because built-in `Markdown` uses Marked and `dangerouslySetInnerHTML`, this is an authoring policy rather than a technical element allowlist. If technical rejection of unsupported syntax, HTML, or URL protocols becomes required, stop and replace this implementation with the constrained AST-to-React direction from the earlier plans.

Critical Markdown styling must be emitted directly on each generated element through a complete `markdownCustomStyles` map. Do not style Markdown children through a wrapper's descendant CSS, Tailwind `prose`, arbitrary variants such as `[&_p]:...`, child/sibling selectors, or `space-*`. `markdownContainerStyles` may set a literal baseline font/color, but it must not be the only source of child typography, spacing, link, list, or table styles.

Extract and reuse the existing application email shell. Keep existing structured transactional bodies as React Email components; do not convert them to Markdown. Add one new versioned Markdown template and endpoint.

## Repository Findings That Shape The Work

- Six base templates repeat `Html`, `Head`, `Preview`, `Tailwind`, `Body`, a 600 px bordered `Container`, and `Footer`: sign-in, sign-up, invitation, password-change, email-change, and invoice.
- Organization and team invitation templates delegate to `InvitationV1Template`; they do not own another shell.
- Existing content uses direct Tailwind utilities on actual React Email elements. `LinkButton.tsx` and `CodeBlock.tsx` already use direct inline styles for exceptional elements.
- The active route in `src/server/routes/addRoutesTemplates.ts` parses JSON and calls `renderFn` without applying the registered Valibot schema. `src/server/handleRenderRequest.ts` has validation logic but is not used by that Hono route.
- Current render routes have no authentication. Default CORS may be `*`; CORS does not establish trusted delivery.
- The installed `@react-email/markdown` is `0.0.18`. It inserts Marked output with `dangerouslySetInnerHTML`, supports tables, applies `markdownCustomStyles` inline, and cannot disable unsupported syntax or raw HTML.
- In this installed Markdown renderer, `tablecell` applies the `td` style entry to both emitted `<th>` and `<td>` elements. The declared `th` entry is not read. The implementation must provide the complete shared cell style under `td`, also provide the intended `th` entry for documentation/forward compatibility, and have a regression test for the currently rendered header-cell style.
- Default Markdown-to-text conversion flattens table cells. The installed `@react-email/render`/`html-to-text` stack can preserve a Markdown data table with the `dataTable` formatter and the supported direct-child selector `[data-id=react-email-markdown]>table`. A descendant selector containing a space is not supported by the installed selector parser. This selector is only for plain-text conversion, not CSS styling.
- Current Tailwind values resolve to `18px`/`28px` for `text-lg`, `#155dfc` for `text-blue-600`, `#f9fafb` for `bg-gray-50`, `#eaeaea` for borders, `12px` for `p-3`, `4px` for `mb-1`, and weight `600` for `font-semibold`.
- `bun x tsc --noEmit -p tsconfig.json` currently fails because React/JSX declarations are absent. `bun run build` succeeds because it builds only `client/`.
- The recorded Worker dry-run baseline remains 3,147.86 KiB uncompressed and 713.50 KiB gzip using Wrangler 4.107.0 and `wrangler.example.toml`.

## Target Contract And Data Flow

Use the additive route name `markdownV1` and request type `MarkdownV1Type`:

```ts
export interface MarkdownV1Type extends MayHaveLanguageType, FooterV1Type {
  subject: string
  preview?: string
  heading?: string
  markdown: string
}
```

Contract rules:

- `subject` is required plain text, trimmed, non-empty, at most 200 characters, and contains no CR/LF.
- `preview` and `heading` are optional plain text, trimmed, non-empty when supplied, and at most 200 characters. Each defaults to `subject`.
- `markdown` is required, preserves internal whitespace/newlines, is non-empty after outer trimming, and has a provisional maximum of 20,000 characters. Lower this before release if the maximum table fixture exceeds runtime or 90 KiB rendered-HTML budgets.
- `l` uses the existing language contract and defaults to English.
- Existing footer names are preserved, including `hompageSubtitle`.
- The successful response remains exactly `subject`, `text`, and `html`, with `Cache-Control: no-store`.
- The Markdown route requires `Authorization: Bearer <MARKDOWN_RENDER_TOKEN>`. Check authorization before reading/parsing the body. Store the production token as a Worker secret, never in a TOML file or client bundle.
- A deployment may omit application-level bearer auth only when a named, tested private gateway prevents every other caller from reaching this route. Record that exception before implementation; otherwise use the token design in this plan.
- Do not interpolate recipient/account values into `markdown`. `subject`, `preview`, `heading`, and footer data stay separate escaped React props.

Data flow:

```text
trusted authoring caller
  -> bearer/private-boundary check
  -> bounded body read and JSON parse
  -> Valibot runtime parse
  -> MarkdownV1Template
  -> shared EmailLayout
       -> escaped Heading
       -> TrustedMarkdownContent
            -> React Email Markdown
            -> direct inline markdownCustomStyles
       -> existing Footer
  -> @react-email/render once
  -> toPlainText with Markdown-table dataTable selector
  -> { subject, text, html }
```

## Exact Likely Files

### New Files

- `src/template_parts/EmailLayout.tsx`: shared document/body/container/footer shell.
- `src/template_parts/TrustedMarkdownContent.tsx`: trust-explicit built-in Markdown wrapper and the only Markdown style map.
- `src/templates/markdown/MarkdownV1Template.tsx`: new previewable template.
- `src/server/render/renderMarkdownV1.tsx`: render-once HTML and plain-text orchestration.
- `src/server/schemas/markdownV1Schema.ts`: request schema and field bounds.
- `client/types/MarkdownV1Type.ts`: public request type with no React imports.
- `client/apiGenerateEmailMarkdownV1.ts`: authenticated typed API call.
- `test/emailLayout.test.ts`: shell regression assertions.
- `test/markdownRendering.test.ts`: supported-element, inline-style, table, and text tests.
- `test/apiMarkdown.test.ts`: authenticated route E2E and negative contract tests.

### Existing Files To Update

- `package.json`, `bun.lock`, and `tsconfig.json`: establish the React/JSX typecheck baseline with the intended React declarations.
- `src/templates/sign_in/SignInV1Template.tsx`
- `src/templates/sign_up/SignUpV1Template.tsx`
- `src/templates/invitation/InvitationV1Template.tsx`
- `src/templates/password_change/PasswordChangeV1Template.tsx`
- `src/templates/email_change/EmailChangeV1Template.tsx`
- `src/templates/invoice/InvoiceV1Template.tsx`
- `src/env/Env.ts`: declare the optional-at-process-start `MARKDOWN_RENDER_TOKEN`; the trusted route must fail closed when it is absent.
- `src/server/server.ts`: pass Bun environment bindings to Hono if required for the same auth code to work under Bun and Workers.
- `src/server/api/ApiRouteDefType.ts`: add route metadata for bearer protection and an optional request-byte limit.
- `src/server/api/apiRouteDef.ts`: register `markdownV1` with its schema, renderer, auth requirement, and size limit.
- `src/server/routes/addRoutesTemplates.ts` and likely `src/server/handleRenderRequest.ts`: enforce auth, bounded body reading, JSON errors, Valibot parsing, status mapping, and no-store behavior before rendering.
- `src/server/routes/addRoutesOpenapi.ts`: define bearer authentication in OpenAPI.
- `client/emailTemplateName.ts`: add `markdownV1`.
- `client/generateEmailApiCall.ts`: permit the new wrapper to pass an authorization header without changing existing callers.
- `client/index.ts`: export the new type and wrapper.
- `test/openapi.test.ts`: assert the new request schema, bounds, 401/413 responses, and bearer requirement.
- `test/clientImports.test.ts`: no logic change should be needed, but it is an acceptance gate for the new client files.
- `README.md`: document the trusted-only Markdown profile, endpoint/auth requirement, table limits, preview command, and AST migration trigger.

Do not hand-edit `dist/`. `bun run build` regenerates published client output. Do not add a Markdown parser dependency; the built-in component is already available through `@react-email/components`.

## Shared Layout Rules

`EmailLayout` should accept `lang`, `preview`, footer props, and `children`. It owns only:

- One `Html` and `Head`.
- One `Preview`.
- The existing `Tailwind` boundary.
- `Body` with `bg-gray-50 my-auto font-sans px-2`.
- The current main `Container` classes: `max-w-[600px] bg-white mt-10 mb-0 p-4 border border-solid border-[#eaeaea] rounded-xl`.
- The existing `Footer` after the main container.

It must not own a subject, visible heading, Markdown, translations, buttons, invoice details, or content-specific sections. Keep the existing Tailwind shell unchanged rather than converting the entire application to inline CSS in this feature.

Migrate one base template at a time. Compare normalized HTML and plain text after each migration. `OrgInvitationV1Template` and `TeamInvitationV1Template` require no direct shell migration because they delegate to the invitation template. Existing structured bodies remain unchanged.

## Markdown Element Style Contract

Own one module-level `markdownContainerStyles` object and one module-level `markdownCustomStyles` object inside `TrustedMarkdownContent.tsx`. Callers receive only a `markdown: string` prop and cannot override styles, parser options, classes, or raw HTML behavior.

Translate the visual values from existing templates into literal, pixel-based styles. The initial map should use these values, with changes requiring rendered-fixture review:

| Style key | Required direct values | Existing source |
| --- | --- | --- |
| Container | Web-safe sans-serif family and literal base color; no descendant selectors | Existing `font-sans` body intent |
| `p` | `fontSize: 18`, `lineHeight: "28px"`, `margin: "16px 0 4px"`, literal text color | `text-lg mb-1` `Text` output |
| `bold` | `fontWeight: 600` | `font-semibold` |
| `link` | `color: "#155dfc"`, `textDecoration: "none"`, `fontSize: 18`, `lineHeight: "28px"` | `text-blue-600 no-underline text-lg` |
| `ul` | `listStyleType: "disc"`, `paddingLeft: 24`, `margin: "16px 0 4px"` | Existing 18 px prose spacing, conservative native list |
| `li` | `fontSize: 18`, `lineHeight: "28px"`, `margin: "0 0 4px"`, literal text color | `text-lg mb-1` |
| `table` | `width: "100%"`, `tableLayout: "fixed"`, `borderCollapse: "collapse"`, `backgroundColor: "#ffffff"`, `margin: "8px 0 16px"` | Invoice details width, `mt-2`, white container |
| `thead` | `backgroundColor: "#f9fafb"`, `fontWeight: 600`, literal heading color | Invoice `bg-gray-50`, value `font-semibold` |
| `tbody` | `backgroundColor: "#ffffff"` | Main content background |
| `tr` | `verticalAlign: "top"` | Email-safe row alignment |
| `th` | `padding: 12`, `border: "1px solid #eaeaea"`, `fontSize: 18`, `lineHeight: "28px"`, `fontWeight: 600`, `textAlign: "left"` | Invoice `p-3`, border, text-lg, font-semibold |
| `td` | The full shared cell style: `padding: 12`, `border: "1px solid #eaeaea"`, `fontSize: 18`, `lineHeight: "28px"`, `textAlign: "left"`, literal cell color | Invoice details cells and border palette |

Use a conservative web-safe/system font stack resolved to a literal string. Use `#000000` for ordinary/header text and `#4a5565` only where the design intentionally mirrors invoice secondary labels. Do not use `rem`, `em` for critical sizes, CSS variables, flex, grid, pseudo-selectors, `!important`, media-query-only styles, or required rounded corners.

The complete cell declaration must be in `td` because installed `@react-email/markdown` applies `td` styles to both header and data cells. Keep the equivalent `th` declaration so intent remains visible and a future fixed dependency does not produce unstyled headers. Do not patch `node_modules`.

Every supported fixture must remain legible after all `<style>` blocks are removed. Shell Tailwind can remain, but paragraph, bold, link, list, and table appearance must be visible in inline `style` attributes on the generated tags.

## Table Safety And Limitations

- Support only pipe-delimited GFM tables with one header row and ordinary body rows. The built-in Marked configuration supplies this syntax.
- Keep authored tables simple: at most four columns, short labels/cells, no nested tables, no raw HTML, no multiline cells, no images, and no reliance on colspan/rowspan.
- Links and bold text may occur inside cells because both have complete direct styles. Prefer descriptive link labels; do not put long bare URLs or unbroken identifiers in narrow cells.
- `width: 100%` and `tableLayout: fixed` keep ordinary content within the 600 px shell, but no CSS property can guarantee wrapping of every long token in classic Outlook. Authored content constraints and real-client tests are required.
- Do not add a horizontally scrolling wrapper. Overflow/scroll behavior is unreliable in email, and classic Outlook does not provide a dependable mobile-table fallback.
- Do not hide columns or convert rows to cards with media queries. The simple table must remain understandable at its base width.
- Border radius is decorative and omitted for collapsed data tables. Square rendering is the accepted Outlook fallback.
- Built-in Markdown does not enforce row/column limits or reject other syntax. These limits are review policy under the approved trusted-author model. Technical enforcement requires the AST renderer.
- Inline styles repeat on every cell and can rapidly increase HTML size. Include a maximum-size table fixture, measure final HTML bytes, retain headroom below Gmail's clipping threshold, and lower the Markdown source limit if needed.
- Inbox tests must include a one-column narrow viewport, long localized labels, an empty-looking value, links/bold inside cells, and the maximum approved column count.

## Plain-Text Strategy And Limitations

Render `MarkdownV1Template` once to HTML, then call `toPlainText(html, options)`. Do not parse/render Markdown twice for the new template.

Add only this custom formatter selector:

```ts
selectors: [{ selector: "[data-id=react-email-markdown]>table", format: "dataTable" }]
```

This direct-child selector targets Markdown data tables while leaving React Email's many presentation/layout tables on their normal formatter. It is not a CSS styling selector. Pin its behavior with a test because it relies on the built-in Markdown wrapper's current `data-id` and direct table nesting.

Expected text behavior:

- Paragraph order and blank-line separation remain readable.
- Bullet lists retain `*` markers.
- Labeled links include the destination; a bare URL is not duplicated.
- Bold has no visual weight in text and is represented by its content only.
- Tables retain rows and aligned columns, with header labels uppercased by the installed `dataTable` formatter.
- Long/wrapped table cells may still align poorly and machine/search accessibility can be worse than a sentence or bullet list. Every important table conclusion must also appear in prose; plain-text recipients must not need spatial table alignment to understand the message.
- The downstream sender, not this service, is responsible for assembling HTML and text into a multipart email. Validate both MIME alternatives in staging.

Do not globally format all `<table>` tags as data tables: that would turn the shared shell and React Email layout tables into noisy text. Do not strip tags with an ad hoc regex.

## Independently Verifiable Implementation Tasks

### 1. Establish A Clean Baseline

Update `package.json`, `bun.lock`, and `tsconfig.json` with the intended React type declarations (`@types/react` and the corresponding `types` entry). Do not mix feature behavior into this change.

Verification:

```bash
bun install
bun x tsc --noEmit -p tsconfig.json
bun run build
bun run test
```

Record the pre-feature Worker dry-run baseline of 713.50 KiB gzip. If the existing Bun test process reports passing assertions but does not terminate, fix or separately record the existing `test/setup.ts` shutdown issue before using test completion as a release gate.

### 2. Enforce Runtime And Trust Boundaries

Use `src/server/handleRenderRequest.ts` from the active Hono template route, or move its bounded parsing behavior into `addRoutesTemplates.ts`; do not maintain two divergent validation paths. Add generic route metadata such as `requiresBearerAuth` and `maxBodyBytes`. Authenticate the Markdown route before reading its body, enforce its byte limit before Markdown parsing, apply `safeParse` to every registered schema, and return bounded `400`, `401`, `413`, and `500` errors without reflecting the Markdown/token.

Verification:

- Existing valid API tests still return 200.
- An existing wrong-type/oversized request now returns 400 before its renderer.
- Missing/wrong Markdown bearer tokens return 401 before body parsing/rendering.
- An oversized Markdown request returns 413.
- A valid token and body reaches a temporary test renderer.
- `Cache-Control: no-store` remains on successful render responses.

### 3. Extract And Reuse `EmailLayout`

Add `src/template_parts/EmailLayout.tsx` from the exact current shell. Migrate sign-in first, then invoice as the structural counterexample, then sign-up, invitation, password-change, and email-change one at a time. Do not alter inner template content or convert it to Markdown.

Verification after each file:

- Normalized HTML retains one document, preview, body, 600 px main container, and footer.
- Plain-text subject/body/footer order remains equivalent.
- Existing `PreviewProps`, localization, links, invoice paid/unpaid/attachment variants, and API tests remain valid.
- `bun run dev:email` still opens every existing preview.

### 4. Add The Trusted Markdown Wrapper

Add `TrustedMarkdownContent.tsx` with the exact supported style keys and no caller customization. Include a short warning that content is trusted and unsanitized. Add `markdownRendering.test.ts` before adding a route.

Verification:

- One fixture includes two paragraphs, bold, a labeled HTTPS link, a bare HTTPS URL, a two-level bullet-list case for degradation review, and a four-column table with bold/link cells.
- Every emitted `p`, `strong`, `a`, `ul`, `li`, `table`, `thead`, `tbody`, `tr`, `th`, and `td` has the expected direct inline style where applicable.
- Header cells receive the shared `td` declaration under installed version `0.0.18`; the test documents the upstream quirk.
- Output contains no `prose`, `[&_...]`, `space-*`, CSS variables, critical `rem`, or Markdown descendant style rules.
- Removing `<style>` blocks leaves Markdown content legible.

### 5. Add The New Template And Renderer

Add `MarkdownV1Template.tsx` using `EmailLayout`, an escaped React Email `Heading` styled like existing `text-2xl font-semibold mb-0` headings, and `TrustedMarkdownContent`. Add representative `PreviewProps` containing exactly the approved syntax. Add `renderMarkdownV1.tsx`; render HTML once and derive text with the scoped `dataTable` formatter.

Verification:

- Preview, heading, and subject fallbacks are deterministic and subject is never parsed as Markdown.
- Output has one email shell and one Markdown wrapper, with no nested `Html`, `Head`, `Body`, preview, or footer.
- Plain text preserves bullets, both link forms, table rows/columns, body order, and footer.
- The formatter does not expose any shell/layout table in plain text.

### 6. Add The Versioned API And Client

Add `MarkdownV1Type`, `markdownV1Schema`, renderer registration, email template name, authenticated client wrapper, and barrel exports. Use a provisional body limit slightly above the encoded maximum request and tune it after the maximum fixture benchmark. Document bearer auth in OpenAPI and README.

Verification:

- `apiGenerateEmailMarkdownV1` returns `PromiseResult<GeneratedEmailType>` and sends the bearer token without changing existing wrapper signatures/behavior.
- `client/` imports no React, renderer, schema, or `src/` modules.
- OpenAPI describes all fields, bounds, bearer security, and 200/400/401/413/500 responses consistently with runtime behavior.
- The generated client build contains the new declarations and no React dependency.

### 7. Add E2E And Negative Coverage

Add `apiMarkdown.test.ts` using the representative supported fixture. Add negative tests for malformed JSON, missing/wrong auth, wrong field types, missing/blank Markdown, subject CR/LF, oversized source/body, and unknown fields according to the new schema policy.

Because built-in Markdown is intentionally trusted-only, do not write a false test claiming arbitrary raw HTML or unsafe URLs are sanitized/rejected. Instead assert that the approved fixture contains no unsupported syntax and that route access preserves the trusted-delivery boundary. Add a prominent test/documentation note that raw HTML and non-HTTPS links can pass through if a trusted author supplies them.

Verification:

- A valid request returns exactly `subject`, `text`, and `html` and has `Cache-Control: no-store`.
- HTML contains the complete shell, styled supported elements, and no unsupported elements from the approved fixture.
- Text contains readable paragraphs, bullet markers, destinations, and data-table rows.
- Existing API, OpenAPI, cache, and client-import tests pass.

### 8. Validate Runtime, Size, Preview, And Inboxes

Measure representative prose and maximum table-heavy input under Bun and workerd. Compare the Worker bundle against 713.50 KiB gzip. Record HTML bytes and lower the source/body limit until maximum valid output remains below the agreed 90 KiB pre-send threshold.

Use React Email preview for rapid visual work, but release only after real-client checks in Gmail web/mobile, Apple Mail macOS/iOS, Outlook.com/new Outlook, and classic Outlook Windows when it is a supported target. Record exact client/OS/account type and normal/dark mode. Verify 320 px/narrow rendering, large text, long localized cells, links, bullets, border/color degradation, and four-column tables.

## Test Commands

Focused tests while implementing:

```bash
bun test --preload ./test/setup.ts test/emailLayout.test.ts
bun test --preload ./test/setup.ts test/markdownRendering.test.ts
MARKDOWN_RENDER_TOKEN=dev-only bun test --preload ./test/setup.ts test/apiMarkdown.test.ts
```

Full local acceptance:

```bash
bun x biome check client src test package.json tsconfig.json tsconfig.lib.json biome.json
bun x tsc --noEmit -p tsconfig.json
bun run test
bun run build
bun x wrangler deploy --dry-run --config wrangler.example.toml
```

Bun dev-server E2E:

```bash
MARKDOWN_RENDER_TOKEN=dev-only bun run dev:bun
curl --fail-with-body -sS http://localhost:3055/renderEmailTemplate/markdownV1 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer dev-only' \
  --data-binary '{"l":"en","subject":"July update","preview":"Highlights and plans","heading":"July update","markdown":"A paragraph with **bold text** and a [labeled link](https://example.com/details).\n\nhttps://example.com/status\n\n- First item\n- Second item\n\n| Plan | Status | Owner | Link |\n| --- | --- | --- | --- |\n| Pro | Active | Team | [Details](https://example.com/details) |","homepageText":"example.com","homepageUrl":"https://example.com","hompageSubtitle":"Excellency by design"}'
```

React Email preview:

```bash
bun run dev:email
```

Open the URL printed by the React Email CLI and inspect `MarkdownV1Template` at desktop and narrow viewport widths.

Worker dev-server E2E:

```bash
bun x wrangler dev --config wrangler.example.toml --var MARKDOWN_RENDER_TOKEN:dev-only
curl --fail-with-body -sS http://localhost:8787/renderEmailTemplate/markdownV1 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer dev-only' \
  --data-binary '{"subject":"Worker Markdown test","markdown":"Paragraph.\n\n- One\n- Two\n\n| Key | Value |\n| --- | --- |\n| Runtime | Worker |","homepageText":"example.com","homepageUrl":"https://example.com","hompageSubtitle":"Excellency by design"}'
```

Production secret setup is operational work, not a repository edit:

```bash
bun x wrangler secret put MARKDOWN_RENDER_TOKEN --config <target-wrangler-config>
```

## Acceptance Criteria

- React Email's built-in `Markdown` is used only by `TrustedMarkdownContent` and only for trusted/self-authored content delivered through the approved private/authenticated boundary.
- The new additive `markdownV1` template supports and documents only paragraphs, bold, HTTPS URLs/links, unordered bullet lists, and simple tables.
- Existing structured templates continue using React Email components and reuse the extracted `EmailLayout` without body-content migration.
- All critical supported-element styles are literal direct inline styles from `markdownCustomStyles`; no container descendant Tailwind/CSS mechanism is required.
- Markdown visual values match the existing 18 px prose, blue links, gray/white table palette, 12 px cell padding, 1 px `#eaeaea` borders, and 600 weight.
- Table headers and cells render with complete direct styles despite the installed `th`/`td` mapping quirk.
- Tables remain inside the 600 px shell for approved fixtures and degrade acceptably without scrolling, responsive column hiding, or rounded corners.
- Plain text preserves bullets, link destinations, and readable data-table rows while ignoring presentation tables. Important information remains understandable without spatial table alignment.
- Runtime Valibot parsing, auth, and source/body limits run before Markdown rendering. Errors do not reflect source content or credentials.
- Output has one document shell, preview, body, main container, Markdown wrapper, and footer, and preserves exactly `{ subject, text, html }` plus `no-store`.
- Focused tests, full Bun tests, clean typecheck, formatting/lint check, client build, Worker dry-run, Bun E2E, workerd E2E, preview review, output-size gate, and required inbox checks pass.
- No new Markdown/parser/sanitizer/MJML dependency is added, no `node_modules` patch is made, and `dist/` is generated rather than hand-edited.

## Explicit Limitations And Escalation Triggers

- The trusted wrapper does not sanitize, validate protocols, enforce the supported syntax, or make raw HTML impossible.
- Authentication proves caller identity, not Markdown safety. Sole authorship, review, and no untrusted interpolation remain required.
- HTTPS can still target phishing, tracking, redirects, or compromised hosts. Link review remains an author responsibility.
- Tables are not a responsive layout system. Complex, wide, nested, interactive, or untrusted tables are out of scope.
- Plain-text table alignment is best-effort and unsuitable as the only representation of essential meaning.
- Marked or React Email dependency upgrades can change generated tags, `data-id`, GFM table behavior, style mapping, and plain-text output. Review normalized fixtures on every relevant lockfile update.
- Move to a constrained AST/component renderer before accepting public/customer/CMS/database/webhook content, interpolating untrusted fields, technically enforcing element/URL policy, adding richer table semantics, or mapping Markdown nodes to project React components.

## Final Local Validation Note

Date: 2026-07-27

- The provisional 20,000-character Markdown limit failed the required rendered-size gate: a 19,988-character compact four-column table produced 574,949 bytes of HTML.
- Compact-table boundary measurements were 88,057 HTML bytes at 1,000 Markdown characters and 108,967 bytes at 1,246 characters.
- The implemented Markdown source maximum is therefore 1,000 characters. A regression test keeps the maximum compact four-column fixture below 90 KiB.
