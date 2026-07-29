# Trusted-Author React Email Markdown Architecture Plan

Date: 2026-07-27
Status: Reviewable architecture plan. No application code is implemented by this document.

## Conversation Summary

The conversation began with an assessment of Markdown-authored email bodies rendered inside a shared application email layout. Local research found that the project already uses React Email end to end, repeats the same outer document shell in its templates, returns both HTML and plain text, and runs under Bun and Cloudflare Workers. The first assessment recommended a narrow Markdown profile, a shared child-based layout, runtime request validation, explicit email-client testing, and an AST-to-React renderer for input assumed to be untrusted.

The next question compared continuing with React Email, replacing it with MJML, and building an MJML-like system. The resulting decision was to keep React Email: the current emails are mostly single-column transactional layouts, React Email is already integrated with the templates and Worker runtime, MJML would not itself sanitize Markdown, and a custom email compiler would create unjustified maintenance and compatibility work.

The latest clarification is that the Markdown is authored solely by the user, not unknown third parties. That lowers the proportionate security requirement, but it does not by itself prove that a request-time Markdown field is trusted: the repository's current template routes have no authentication, default CORS can be `*`, and the registered Valibot request schemas are used for OpenAPI but are not enforced before rendering. This plan therefore distinguishes trusted authorship from trusted delivery and defines when React Email's built-in `Markdown` component is acceptable.

Prior plans:

- `docs/20260727_markdown_email_content_and_shared_layout_plan.md`
- `docs/20260727_react_email_vs_mjml_markdown_architecture_plan.md`

## Current Questions

1. Given that the user is the sole Markdown author, is React Email's built-in `Markdown` component now an acceptable and proportionate choice, despite its use of unsanitized HTML output?
2. What concrete React Email architecture, API contract, module split, implementation sequence, and rollout should generate Markdown emails while reusing the existing application shell?

## Short Answers

### 1. Built-In Markdown

Yes, conditionally. React Email's built-in `Markdown` is proportionate when all Markdown reaching it is controlled and reviewed by the user, the delivery path cannot be used by other callers, no untrusted values are interpolated into Markdown before parsing, and raw HTML/unsafe URLs are excluded by authoring policy and review. In that model, adding a second Markdown AST and sanitizer stack is unnecessary complexity.

It is not acceptable for a `markdown` field on the project's currently unauthenticated public route. CORS is not authentication, and the current code does not validate request bodies at runtime. If the route remains public, the server should accept an allowlisted `contentId` and select bundled author-controlled Markdown rather than accept Markdown text. If arbitrary callers, a CMS, user-generated values, or a broader API may supply Markdown now or later, use the constrained AST-to-React design from the earlier plans instead.

### 2. Architecture

Keep React Email and add three small presentation boundaries: a shared `EmailLayout`, a thin trusted-only `TrustedMarkdownContent` wrapper around React Email's `Markdown`, and a `MarkdownV1Template` that composes them. Add a dedicated validated renderer and additive `markdownV1` client/API contract. Render HTML once with `@react-email/render`, derive text with `toPlainText`, and preserve the existing `{ subject, text, html }` response.

The recommended request-time contract below is conditional on an authenticated/internal-only caller. If that trust condition cannot be guaranteed, use the server-selected `contentId` contract described under "Trust-Preserving Contract Alternative."

## Decision And Recommendation

Adopt the built-in React Email `Markdown` component for the first version only under the trusted-author and trusted-delivery conditions in this plan. Wrap it in a component named `TrustedMarkdownContent` so the trust assumption is visible at every call site. Do not claim that this wrapper sanitizes input.

The proportionate first version should:

- Continue with React Email; do not introduce MJML.
- Extract the existing document shell rather than creating a second email framework.
- Use `Markdown` with complete pixel-based `markdownCustomStyles` for every enabled element.
- Support authored paragraphs, `h2`-`h4`, emphasis, strong text, links, ordered/unordered lists, block quotes, horizontal rules, line breaks, and plain code.
- Reserve `h1` for the template's visible heading.
- Prohibit raw HTML, images, tables, task inputs, embeds, SVG, and syntax highlighting by authoring policy for version 1.
- Permit absolute `https:` links and, if needed, `mailto:` links. Do not use relative, protocol-relative, `javascript:`, `data:`, or fragment-only destinations.
- Enforce request shape and source length before rendering.
- Require authentication or an equivalent private service boundary for request-provided Markdown.
- Switch to an allowlisted AST-to-React renderer before widening the trust boundary or promising technical enforcement of the Markdown subset.

This recommendation deliberately accepts a small residual risk because there is one trusted author. If the user's requirement is instead "unsafe HTML and URLs must be impossible even after author error," the built-in component does not meet that requirement and the AST renderer is the correct initial choice.

## Why Built-In Markdown Is Conditionally Acceptable

The locally installed `@react-email/markdown` version is `0.0.18`, reached through `@react-email/components`. Its implementation:

- Calls `marked.parse(children, { renderer, async: false })`.
- Inserts the resulting HTML into a `<div>` with `dangerouslySetInnerHTML`.
- Applies supplied element styles directly to generated HTML.
- Emits links, images, tables, and raw HTML without an application-specific allowlist.
- Does not expose a prop to disable raw HTML or restrict URL schemes.

Marked explicitly states that it does not sanitize output and recommends sanitizing potentially unsafe input. That warning is decisive for unknown or potentially compromised input, but sanitization is not automatically required for source code, templates, or content controlled and reviewed by the same trusted author who controls deployment. React applications routinely render trusted static HTML under an equivalent assumption.

The built-in component is acceptable only while every condition below is true:

- The sole author controls the source of the Markdown.
- The Markdown is reviewed or previewed before production use.
- The request path is authenticated/private, or the server selects immutable bundled content by ID.
- No recipient, account user, external service, CMS plugin, webhook, database row editable by others, or URL-fetched document can influence the Markdown.
- Dynamic values are rendered outside Markdown as escaped React children, or are proven to be trusted author content. They are not concatenated into the Markdown string.
- Version 1 does not rely on raw HTML, images, or arbitrary link protocols.
- Source size and request shape are bounded.
- The dependency is pinned by the lockfile and reviewed when upgraded.
- A future change in input provenance is treated as an architecture change, not merely an API addition.

## Residual Risks Under Trusted Authorship

Trusted does not mean risk-free. The first version explicitly accepts these residual risks:

- **Compromised source:** A compromised repository account, local machine, CI token, deployment credential, upstream content store, or npm dependency could insert hostile Markdown or alter parser behavior.
- **Compromised caller:** If Markdown is sent at request time, stolen API credentials or an accidentally public route can turn trusted input into attacker-controlled input.
- **Future API access:** Another team may later reuse `markdownV1`, expose it to customers, add a CMS, or interpolate user fields without recognizing the component's trust-only assumption.
- **Author error:** The author can accidentally add raw HTML, a misleading destination, a `javascript:`/`data:` URL, an unwanted remote image, or malformed markup. The component does not prevent this.
- **Unsafe output contexts:** Many inboxes strip scripts and dangerous attributes, but the service's HTML may also be logged, archived, displayed in a browser preview, or processed by downstream software. Email-client filtering is not a security boundary.
- **Phishing/privacy:** An HTTPS URL can still be malicious or misleading. Remote images can track opens and disclose recipient metadata even when their scheme is safe.
- **Parser quirks:** Marked documents zero-width-character parsing concerns, supports raw HTML and broad GFM syntax, and may change output across dependency upgrades.
- **Email rendering:** Valid browser HTML is not necessarily reliable email HTML. Lists, nested blocks, code, tables, long URLs, margins, `rem` units, and raw HTML can differ across Gmail, Outlook variants, Apple Mail, Yahoo, and mobile clients.
- **Plain text:** HTML-to-text conversion may alter list spacing, code, or link presentation. HTML review alone is insufficient.

Proportionate controls are authentication/private delivery, runtime size validation, reviewable fixtures, explicit inline styles, dependency review, and inbox tests. A sanitizer is not recommended initially because it adds a second transformation/runtime dependency while still requiring an email-specific policy. It becomes warranted when the trust boundary broadens or prevention rather than author discipline is required.

## Proposed Request And Response Contracts

### Recommended Request-Time Contract

Endpoint: `POST /renderEmailTemplate/markdownV1`

Headers:

```http
Content-Type: application/json
Authorization: Bearer <service credential>
```

The `Authorization` requirement may be satisfied by a verified upstream private gateway instead of this application, but the boundary must be documented and tested. The current application does not enforce it.

Proposed TypeScript shape:

```ts
export interface MarkdownV1Type extends MayHaveLanguageType, FooterV1Type {
  subject: string
  preview?: string
  heading?: string
  markdown: string
}
```

Proposed JSON example:

```json
{
  "l": "en",
  "subject": "July product update",
  "preview": "What changed this month",
  "heading": "July product update",
  "markdown": "Thanks for reading.\n\n## Highlights\n\n- Faster reports\n- Clearer exports\n\n[Read more](https://example.com/updates)",
  "homepageText": "Example",
  "homepageUrl": "https://example.com",
  "hompageSubtitle": "Product updates from Example"
}
```

Proposed validation behavior:

- `l`: existing `en`/`de` schema and fallback behavior.
- `subject`: required, trimmed, non-empty, maximum 200 characters, no CR/LF.
- `preview`: optional, trimmed, non-empty when present, maximum 200 characters; defaults to `subject`.
- `heading`: optional, trimmed, non-empty when present, maximum 200 characters; defaults to `subject`.
- `markdown`: required, non-empty after outer trim, provisional maximum 20,000 characters. Preserve internal whitespace and line endings.
- Footer fields: preserve the existing names and compatibility, including the existing misspelling `hompageSubtitle`; apply current limits, but validate `homepageUrl` as an absolute approved URL.
- JSON/body: set a body-size limit slightly above the maximum encoded contract before JSON parsing, then use `safeParse` on the registered Valibot schema before calling the renderer.
- Unknown fields: choose reject or strip explicitly; reject is recommended for a new versioned endpoint so authoring mistakes are visible.

No interpolation/variables field is proposed for version 1. Concatenating values into Markdown silently expands the trust boundary and can change Markdown structure. Add typed React-rendered slots later if a real use case appears.

### Successful Response

Preserve `client/types/GeneratedEmailType.ts` exactly:

```ts
export type GeneratedEmailType = {
  subject: string
  text: string
  html: string
}
```

Example:

```json
{
  "subject": "July product update",
  "text": "July product update\n\nThanks for reading...",
  "html": "<!DOCTYPE html ...>..."
}
```

Behavior:

- `subject` is the validated request subject and is not parsed as Markdown.
- `html` is a complete React Email document using the shared shell.
- `text` is derived from the rendered HTML using React Email's `toPlainText` utility.
- The response retains `Cache-Control: no-store`.

### Error Responses

- `400`: malformed JSON, wrong field types, unsupported language, empty/oversized fields, or schema failure; use the project's existing `resultErrSchema` response format and do not reflect the complete Markdown body.
- `401`: missing/invalid credentials when authentication is implemented in this application.
- `413`: request body exceeds the pre-JSON byte limit.
- `500`: unexpected render failure in the existing bounded error format; do not include source Markdown or parser internals.

The OpenAPI response definitions must match actual runtime statuses. If authentication remains entirely upstream, omit the application-level `401` but document the gateway contract.

### Trust-Preserving Contract Alternative

If `markdownV1` remains reachable without authentication, do not accept `markdown`. Use:

```ts
export interface MarkdownV1Type extends MayHaveLanguageType, FooterV1Type {
  contentId: MarkdownContentId
}
```

`contentId` must select an allowlisted server-bundled record containing `subject`, `preview`, `heading`, and `markdown`. Unknown IDs return `400` or `404`. This is the strongest match for "solely authored by me" because callers cannot substitute content. The tradeoff is that content changes require a code/content deployment unless a separately secured content store is introduced.

## Concrete React Email Architecture

### Shared App Shell

Create `src/template_parts/EmailLayout.tsx` with a narrow child-based API:

```ts
type EmailLayoutProps = {
  lang: string
  preview: string
  footer: FooterV1Type
  children: ReactNode
}
```

It owns only the repeated outer structure:

- `Html`, including `lang`.
- `Head`.
- `Preview`.
- `Tailwind` and any agreed pixel-based configuration.
- `Body` global background/font/padding.
- The 600 px white bordered `Container`.
- The existing `Footer` outside the main container.

It does not own subject generation, visible headings, translation, Markdown parsing, buttons, invoice detail rows, or template-specific spacing. That keeps invoice and transactional templates composable without creating a layout DSL.

### Trusted Markdown Boundary

Create `src/template_parts/TrustedMarkdownContent.tsx` as a thin wrapper over `Markdown` from `@react-email/components`.

Responsibilities:

- Accept a `markdown: string` prop only.
- Render React Email's `Markdown` component.
- Supply versioned, explicit `markdownContainerStyles` and complete `markdownCustomStyles` using conservative pixel values.
- Set wrapping behavior for links and code (`overflow-wrap`/`word-break` only after client verification).
- Document in its type/file comment that content must satisfy the trusted-author contract and is not sanitized.

Non-responsibilities:

- It does not authenticate callers.
- It does not validate request size.
- It does not sanitize or claim to enforce the supported syntax.
- It does not accept caller-controlled styles, component maps, parser options, or HTML.
- It does not fetch Markdown or remote assets.

Use a trust-explicit name rather than a generic `MarkdownContent` name. This makes later unsafe reuse easier to detect in review and search.

### Markdown Template

Create `src/templates/markdown/MarkdownV1Template.tsx`.

Responsibilities:

- Resolve `l`, `preview`, and `heading` fallbacks.
- Compose `EmailLayout`.
- Render the visible `Heading` as escaped React text.
- Render the Markdown body through `TrustedMarkdownContent`.
- Expose representative `PreviewProps` for `bun run dev:email`.

The Markdown body is an inner fragment. It must never contain a second `Html`, `Head`, `Body`, preview region, or footer.

### Render Boundary

Create `src/server/render/renderMarkdownV1.tsx`.

Responsibilities:

1. Receive already validated `MarkdownV1Type`.
2. Render `<MarkdownV1Template {...p} />` once to HTML with `@react-email/render`.
3. Call `toPlainText(html)` for text output.
4. Return `{ subject: p.subject, text, html }`.

Rendering once avoids parsing the same Markdown twice. Existing renderers currently call `render` separately for HTML and `{ plainText: true }`; changing them is not required for this feature.

### Validation And Route Boundary

Create `src/server/schemas/markdownV1Schema.ts` and enforce registered schemas in `src/server/routes/addRoutesTemplates.ts` before `def.renderFn` executes. Runtime parsing is a prerequisite, not optional documentation work.

Authentication should be applied before body parsing on the Markdown route. If a route-specific policy does not fit the current generic registry, extend `ApiRouteDefType` with explicit route policy metadata rather than hiding auth inside the renderer. Avoid silently changing all existing endpoint authentication behavior.

### Public Client Boundary

Create:

- `client/types/MarkdownV1Type.ts`
- `client/apiGenerateEmailMarkdownV1.ts`

Update:

- `client/emailTemplateName.ts`
- `client/index.ts`
- `src/server/api/apiRouteDef.ts`

The published client remains React-free and continues to return `PromiseResult<GeneratedEmailType>`. Because `tsconfig.lib.json` builds only `client/`, no React Email implementation types should leak into the package API.

## Module Boundaries

| Module | Owns | Must Not Own |
| --- | --- | --- |
| `client/types/MarkdownV1Type.ts` | Public request shape | React/renderer details |
| `client/apiGenerateEmailMarkdownV1.ts` | Typed HTTP call | Content parsing or trust decisions |
| `src/server/schemas/markdownV1Schema.ts` | Runtime shape/length validation | HTML sanitization claims |
| `src/server/routes/addRoutesTemplates.ts` | JSON parsing, schema enforcement, status mapping | Email presentation |
| Auth middleware/route policy | Caller identity and access | Markdown safety or styling |
| `src/server/render/renderMarkdownV1.tsx` | HTML/text render orchestration | Request parsing/authentication |
| `src/templates/markdown/MarkdownV1Template.tsx` | Template composition and fallbacks | Network or storage access |
| `src/template_parts/EmailLayout.tsx` | Shared document/app shell | Template-specific content |
| `src/template_parts/TrustedMarkdownContent.tsx` | Built-in Markdown and email-safe styles | Sanitization, fetching, arbitrary options |
| `src/template_parts/Footer.tsx` | Existing footer rendering | Markdown content |

## Data Flow

Recommended authenticated request flow:

```text
trusted authoring caller
  -> POST /renderEmailTemplate/markdownV1
  -> authentication/private-gateway check
  -> request byte limit and JSON parse
  -> Valibot safeParse(markdownV1Schema)
  -> renderMarkdownV1(validated props)
  -> MarkdownV1Template
  -> EmailLayout
       -> Heading (escaped React text)
       -> TrustedMarkdownContent
            -> React Email Markdown
            -> marked.parse
            -> inline-styled trusted HTML fragment
       -> Footer
  -> @react-email/render once
  -> complete HTML
  -> toPlainText(HTML)
  -> { subject, text, html } with no-store
```

Public route alternative:

```text
caller contentId
  -> validation
  -> allowlisted bundled content lookup
  -> same template/render path
```

At no point should the client supply styles, components, parser configuration, raw pre-rendered HTML, an MJML document, or a remote Markdown URL.

## Actual Project Locations

Existing architecture verified locally:

- Dependencies and scripts: `package.json`, `bun.lock`
- Shared presentation parts: `src/template_parts/Footer.tsx`, `src/template_parts/LinkButton.tsx`, `src/template_parts/CodeBlock.tsx`
- Repeated shells: `src/templates/sign_in/SignInV1Template.tsx`, `src/templates/invoice/InvoiceV1Template.tsx`, and other `src/templates/*/*Template.tsx` files
- Existing render pattern: `src/server/render/renderSignInV1.tsx` and other `src/server/render/render*.tsx`
- Route registry: `src/server/api/apiRouteDef.ts`, `src/server/api/ApiRouteDefType.ts`
- Generic route: `src/server/routes/addRoutesTemplates.ts`
- Hono app: `src/server/hono.ts`
- Bun/Worker entries: `src/server/server.ts`, `src/server/worker.ts`
- CORS policy: `src/server/headers/getCorsHeaders.ts`
- Worker environment type: `src/env/Env.ts`
- Existing schemas: `src/server/schemas/*.ts`, `src/server/schemas/parts/stringSchema.ts`, `src/server/schemas/parts/footerV1SchemaFields.ts`
- Existing public types: `client/types/`, particularly `client/types/FooterV1Type.ts` and `client/types/GeneratedEmailType.ts`
- Existing client path: `client/generateEmailApiCall.ts`, `client/emailTemplateName.ts`, `client/index.ts`
- Tests: `test/apiSignIn.test.ts`, `test/apiInvoice.test.ts`, `test/openapi.test.ts`, `test/clientImports.test.ts`, `test/workerCache.test.ts`
- Installed implementation evidence: `node_modules/@react-email/markdown/dist/index.mjs`, `node_modules/@react-email/markdown/package.json`
- Runtime/deployment config: `wrangler.example.toml`, `wrangler.david.toml`, `wrangler.leg-tj.toml`, `wrangler.leo.toml`, `data/wrangler.toml`
- Library build boundary: `tsconfig.lib.json`

Proposed files:

- `src/template_parts/EmailLayout.tsx`
- `src/template_parts/TrustedMarkdownContent.tsx`
- `src/templates/markdown/MarkdownV1Template.tsx`
- `src/server/render/renderMarkdownV1.tsx`
- `src/server/schemas/markdownV1Schema.ts`
- `client/types/MarkdownV1Type.ts`
- `client/apiGenerateEmailMarkdownV1.ts`
- `test/apiMarkdown.test.ts`
- `test/markdownRendering.test.ts`

If the content-ID contract is chosen, also add an author-controlled registry under `src/templates/markdown/content/`. Prefer bundled TypeScript string modules initially unless Bun and Wrangler text-module imports for `.md` are proven with the actual configs. Do not use runtime filesystem reads in the Worker.

## Phased Implementation Plan

Each task below is intended to be independently reviewable and verifiable. Product implementation is deferred to a later request.

### Phase 0: Approve Boundaries

1. Choose request-provided Markdown plus authentication, or public `contentId` plus bundled content.
   Verification: one contract is marked accepted and the other rejected/deferred.
2. Decide whether policy-only exclusion of raw HTML/unsafe URLs is sufficient.
   Verification: if technical enforcement is required, replace the built-in-component decision with the AST renderer before implementation.
3. Approve the version 1 Markdown profile and 20,000-character provisional limit.
   Verification: examples of every supported construct and every deferred construct are recorded.
4. Approve `subject`, `preview`, and `heading` ownership/fallbacks.
   Verification: one sample request produces an agreed subject, preheader, visible heading, body, and footer on paper.

### Phase 1: Establish Baselines

1. Record current test, typecheck, build, Worker dry-run size, and representative render output.
   Verification: baseline results distinguish existing failures/timeouts from new regressions.
2. Add normalized HTML/plain-text fixtures for sign-in and invoice without changing templates.
   Verification: fixture tests pass against current output.
3. Resolve or explicitly quarantine the existing missing React JSX type declarations before using typecheck as a gate.
   Verification: the selected typecheck command has a documented expected result.

### Phase 2: Enforce Runtime Contracts

1. Add a focused test proving an existing invalid/oversized request is rejected before rendering.
   Verification: it initially exposes the current validation gap.
2. Parse each registered route body with its Valibot schema in `addRoutesTemplates.ts` and map failures to `400`.
   Verification: valid existing API tests pass and the focused invalid request returns bounded errors.
3. Add the pre-JSON request-body limit appropriate to Hono/Workers.
   Verification: an oversized body returns `413` without invoking a render function.
4. Add route-policy/authentication support only if request-provided Markdown is selected.
   Verification: missing/invalid credentials cannot reach validation/rendering; valid credentials can. Existing route behavior changes only if explicitly approved.

### Phase 3: Extract The Shared Layout

1. Implement `EmailLayout` with the exact sign-in outer markup and no content abstraction.
   Verification: a temporary sign-in migration has equivalent normalized HTML/text and preview behavior.
2. Migrate sign-in to `EmailLayout`.
   Verification: sign-in API, preview, and fixture tests pass.
3. Migrate invoice as the structural counterexample.
   Verification: paid, unpaid-link, and attachment/no-link variants remain correct.
4. Migrate remaining templates one file at a time.
   Verification: each template's API and preview pass before the next migration.

### Phase 4: Add Trusted Markdown Presentation

1. Add `TrustedMarkdownContent` with explicit pixel-based styles and no public parser options.
   Verification: a direct render fixture covers each supported construct.
2. Test long URLs, nested lists to the agreed depth, code, Unicode, and long unbroken text.
   Verification: generated markup contains inline styles and remains bounded by the 600 px shell.
3. Add `MarkdownV1Template` and `PreviewProps` using fixed trusted content.
   Verification: React Email preview loads without a nested document and shows subject/preview/heading distinctions.
4. Render HTML once and derive plain text with `toPlainText`.
   Verification: links include destinations, ordered lists retain ordering, and code remains readable.

### Phase 5: Add The Versioned API

1. Add `MarkdownV1Type`, schema, renderer, template name, route registration, client wrapper, and barrel export.
   Verification: `clientImports.test.ts` passes and the library build emits the new client declarations without React dependencies.
2. Add OpenAPI assertions for required fields, bounds, responses, and authentication metadata if applicable.
   Verification: generated OpenAPI matches runtime behavior.
3. Add an end-to-end API test with representative Markdown.
   Verification: response has the exact subject and readable HTML/text with `Cache-Control: no-store`.
4. Add negative contract tests.
   Verification: malformed JSON, wrong types, empty content, CR/LF subject, unknown fields, and oversized content fail before rendering.

### Phase 6: Runtime And Inbox Validation

1. Compare Worker dry-run bundle size with the recorded baseline.
   Verification: compressed size retains agreed free-tier headroom.
2. Benchmark representative and maximum-size input under Bun and local workerd.
   Verification: p50/p95 render time and memory are recorded; maximum input fits the agreed budget.
3. Send HTML/text fixtures through the downstream mail sender.
   Verification: MIME contains both alternatives and subject/preheader are correct.
4. Test Gmail web/mobile, Outlook web, classic Windows Outlook if supported, Apple Mail, and one additional mobile client.
   Verification: approved screenshots cover normal/dark mode, narrow width, large text, links, lists, code, and long content.
5. Run an authenticated production smoke test or content-ID smoke test.
   Verification: unauthorized content cannot render and logs do not contain full Markdown or credentials.

## Tests And Acceptance Criteria

### Contract And Routing

- Valid `markdownV1` input returns HTTP 200 and exactly `subject`, `text`, and `html`.
- Runtime Valibot parsing occurs before the renderer, not only in OpenAPI generation.
- Wrong types, missing required fields, unknown fields, empty strings, oversized fields, and subject CR/LF are rejected deterministically.
- Body bytes are bounded before JSON/Markdown parsing.
- The endpoint is inaccessible to unauthorized callers, or accepts only an allowlisted `contentId`.
- Error bodies do not reflect the complete Markdown, credential, stack, or parser internals.
- Responses retain `Cache-Control: no-store`.

### Rendering

- Output has one `Html`, one `Head`, one preview/preheader, one `Body`, one main container, and one footer.
- Subject is not interpreted as Markdown.
- `preview` defaults to subject; `heading` defaults to subject.
- Paragraphs, `h2`-`h4`, emphasis, strong text, approved links, lists, quotes, rules, breaks, and code render with explicit inline styles.
- No critical style depends on Tailwind `prose`, complex selectors, `space-*`, CSS variables, flex/grid, or unsupported `rem` behavior.
- Long links/code do not destructively overflow the 600 px container in required clients.
- HTML remains below the agreed generated-size threshold and avoids Gmail clipping in representative cases.

### Plain Text

- Heading and paragraph order match the HTML message.
- Ordered/unordered lists are readable.
- Link destinations remain visible.
- Code blocks remain distinguishable and do not collapse into surrounding prose.
- Preview-only content is omitted if intended.
- Unicode and line endings remain readable.

### Trust Controls

- The component and API documentation say `TrustedMarkdownContent` is not a sanitizer.
- No untrusted string is concatenated into Markdown.
- Fixed authored fixtures contain no raw HTML, images, or disallowed URL schemes.
- Repository review rules include Markdown/content changes and lockfile upgrades.
- A documented trigger requires migration to constrained AST rendering before third-party/CMS/public input is allowed.

The built-in component cannot satisfy an acceptance criterion such as "arbitrary input never emits raw HTML or unsafe URLs." If reviewers require that criterion, Phase 0 must choose the AST alternative.

## Security And Trust Model

### Assets

- Recipient trust and resistance to phishing/tracking.
- HTML consumers, including inboxes, previews, archives, logs, and downstream senders.
- Worker availability, CPU, memory, and response-size budget.
- API credentials and authoring source integrity.
- Subject, content, footer, and destination-link correctness.

### Trusted Principals And Inputs

- The sole human author and reviewed repository/deployment pipeline.
- The existing application code and pinned dependencies, subject to normal supply-chain controls.
- Validated scalar request metadata from the authenticated authoring caller.

### Untrusted Or Not Automatically Trusted

- Internet callers, regardless of CORS origin.
- Recipients and recipient-provided profile/account data.
- Any future CMS, database editor, webhook, URL fetch, template marketplace, or third-party API.
- Dynamic variables originating from users even if a trusted service sends the request.
- Remote link/image destinations and content reached after clicking.
- Dependency updates until reviewed and tested.

### Boundary Rules

- Authentication establishes caller identity; schema validation establishes shape/size; neither sanitizes Markdown.
- Sole authorship is an operational trust claim that must be preserved by access control or server-selected content.
- Do not rely on inbox sanitization, CORS, URL obscurity, or the component name for safety.
- Do not log Markdown bodies or authorization headers by default.
- Rotate credentials and fail closed if application-level authentication is selected.
- Do not add HTML sanitization and then run unsafe transforms after it.
- Reassess the model whenever content provenance, interpolation, storage, or endpoint exposure changes.

## Rollout And Migration Plan

1. Make runtime validation and body limits a separate change before Markdown so existing contracts can be observed and corrected independently.
2. Extract `EmailLayout` incrementally, using existing templates as regression fixtures. Do not combine shell migration with Markdown endpoint work in one review.
3. Add `TrustedMarkdownContent` and preview fixtures without registering a production route.
4. Deploy the new renderer behind either authentication/private routing or a content-ID-only contract.
5. Exercise the endpoint in staging and complete plain-text, Worker, and inbox validation.
6. Add `markdownV1` to the public client package as an additive minor release only after the server route is deployed and compatible.
7. Monitor render errors, CPU, output size, and unauthorized attempts without logging bodies.
8. Keep all existing endpoint names and response contracts unchanged. Existing templates need not migrate their structured body content to Markdown.
9. Roll back by removing/disable-registering only `markdownV1`; shared layout migrations remain safe if their regression fixtures pass.
10. If trust later broadens, preserve `markdownV1` only if its contract explicitly remains trusted; otherwise introduce a new version backed by AST rendering rather than silently changing security semantics.

## Alternatives Considered

### React Email Built-In Markdown With Trusted Input

Chosen conditionally. It is already installed, works inside the React Email tree, supplies inline element styles, supports current Bun/Worker-oriented architecture, and minimizes dependencies and custom code. Its lack of sanitization is acceptable only under the explicit trust boundary.

### Constrained AST-To-React Renderer

Use `react-markdown` or a small mdast pipeline with raw HTML disabled, allowed elements, URL transforms, and component mappings. This remains the preferred option for public, third-party, CMS, or mixed-trust Markdown and for technical enforcement of the syntax policy. It adds dependencies, mapping code, Worker bundle/CPU cost, and maintenance that are disproportionate for one trusted author unless stronger guarantees are required.

### Marked Plus HTML Sanitizer

Parse to HTML, sanitize using a strict email-specific allowlist, then inject. This can secure untrusted input if correctly configured and ordered, but it retains a string-HTML boundary, requires URL/attribute policy, and adds a sanitizer runtime. It is less direct than AST-to-React for this React codebase.

### Bundled Content Selected By ID

Best security fit if the endpoint remains unauthenticated. It preserves sole authorship and allows the built-in component without exposing arbitrary Markdown. It requires deployment for content updates and content registry/version management.

### Precompile Markdown At Build Time

Useful for immutable campaigns, but it does not fit arbitrary request-time content and needs a separate plain-text/output workflow. It is effectively a variant of bundled content and may be reconsidered if deployment-based authoring is acceptable.

### MJML

Rejected for current requirements. It would migrate working TSX templates, add a compiler with less-proven Worker characteristics, and still require a Markdown trust solution. Its responsive section/column strengths do not materially benefit the current simple shell.

### Custom MJML-Like Compiler

Rejected. The project should own reusable components, not a new email language, parser, CSS inliner, Outlook compatibility engine, and preview toolchain.

## Risks And Gotchas

- The current route calls `def.renderFn(body)` directly; schemas shown in OpenAPI are not runtime enforcement.
- The current code has no authentication middleware. `Authorization` is allowed by CORS but not checked.
- Default `Access-Control-Allow-Origin: *` is not the root problem and tightening it is not a substitute for auth; non-browser clients ignore CORS.
- React Email `Markdown` uses `dangerouslySetInnerHTML`; styling its output does not sanitize it.
- The built-in component cannot disable raw HTML, images, tables, or unsafe URL schemes through props.
- Marked's default GFM support is broader than the version 1 authoring profile. Unsupported-by-policy syntax may still render unless review catches it.
- A custom style for an element replaces that element's default React Email Markdown style rather than merging with it. Supply complete styles.
- Built-in defaults use `rem`; override critical typography/spacing with pixels for conservative client support.
- Markdown's injected HTML is not a React component tree. Use the component's own inline style hooks rather than expecting Tailwind `prose` or descendant selectors to inline.
- Link safety is broader than scheme safety. HTTPS can point to phishing, tracking, redirects, or compromised domains.
- Images are both a layout and privacy capability. Defer them even for trusted authors until dimensions, alt text, hosts, and tracking policy are approved.
- Raw HTML may render differently across inboxes and may be preserved in browser previews even if an inbox strips it.
- Deep lists, code blocks, tables, long URLs, zero-width characters, and large inputs can create parser or layout surprises.
- Markdown can expand into substantially larger inline-styled HTML. Measure output size and Gmail clipping.
- Deriving text from HTML is lossy; inspect links, lists, and code.
- The shared shell extraction can alter preheader behavior, Tailwind traversal, body background, footer spacing, or invoice variants.
- Worker deployment success does not prove CPU headroom at maximum content size.
- The installed Markdown package declares Node `>=20`; actual Bun and workerd execution must be tested even though its implementation is ESM and Marked is browser-capable.
- The project's current typecheck baseline reportedly lacks React JSX declarations. Separate that baseline from feature failures.
- Published client types are built independently from `client/`; do not import server schemas or React types into client files.
- Changing content provenance later without changing the component/API name is the highest-likelihood security regression. Keep `Trusted` in the internal boundary name and version external behavior.

## Exact Decision Points For Review

The user should answer each item explicitly before implementation:

1. **Content delivery:** Approve request-provided `markdown` with authentication/private gateway, or choose public `contentId` with server-bundled content.
2. **Security guarantee:** Approve trusted-author policy/review as sufficient, or require technical rejection of raw HTML/unsafe URLs and therefore choose AST-to-React now.
3. **Authentication location:** If request Markdown is selected, approve in-application bearer authentication or identify the exact upstream control that guarantees only the authoring service can call the route.
4. **Existing routes:** Decide whether new auth applies only to `markdownV1` or to all render endpoints. This plan assumes only `markdownV1` unless separately approved.
5. **API fields:** Approve `subject`, optional `preview`, optional `heading`, `markdown`, `l`, and existing footer fields; approve the documented fallbacks.
6. **Content limit:** Approve 20,000 Markdown characters provisionally, subject/preview/heading at 200, with final limits gated by Worker benchmarks.
7. **Markdown profile:** Approve paragraphs, `h2`-`h4`, emphasis, strong, HTTPS links, optional `mailto`, lists, quotes, rules, breaks, and plain code; confirm raw HTML/images/tables/tasks/embeds are deferred.
8. **URL policy:** Confirm whether `mailto:` is needed and whether links must be restricted to an allowlist of domains even for trusted authors.
9. **Unknown fields:** Approve rejecting unknown fields for the new versioned endpoint.
10. **Plain text:** Approve render-once plus `toPlainText` for the new renderer rather than matching the existing render-twice implementation.
11. **Shared shell scope:** Approve extracting `Html`, `Head`, `Preview`, `Tailwind`, `Body`, main 600 px container, and `Footer`, while leaving headings/template details as children.
12. **Content storage:** If `contentId` is chosen, approve bundled TypeScript Markdown strings initially or require a proven `.md` text-module import path under both Bun and Wrangler.
13. **Client matrix:** Approve the required inbox list, especially whether classic Windows Outlook is a release blocker.
14. **Migration:** Approve additive `markdownV1` rollout with no conversion of existing structured templates.
15. **Future trust trigger:** Approve that any public/CMS/third-party/user interpolation requires a new AST-backed version or an explicit security migration before launch.

## Sources

Primary online sources consulted or retained from prior research:

- React Email Markdown component and style API: https://react.email/docs/components/markdown
- React Email render and plain-text utilities: https://react.email/docs/utilities/render
- React Email Tailwind behavior, pixel preset, and limitations: https://react.email/docs/components/tailwind
- React Email source repository: https://github.com/resend/react-email
- Installed Markdown implementation: `node_modules/@react-email/markdown/dist/index.mjs`
- Marked's explicit no-sanitization and zero-width-character warnings: https://marked.js.org/
- Marked options, GFM default, removed sanitizer, and worker guidance: https://marked.js.org/using_advanced
- React Markdown architecture/security alternative: https://github.com/remarkjs/react-markdown
- Rehype sanitize schema and plugin-order guidance: https://github.com/rehypejs/rehype-sanitize
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Gmail CSS support: https://developers.google.com/gmail/design/css

## Review Outcome Template

Implementation should not begin until this block is completed in a review or follow-up decision record:

```text
Content delivery: request markdown / bundled contentId
Security guarantee: trusted policy / technically enforced AST
Authentication boundary: application / named upstream / not applicable to contentId
Auth scope: markdownV1 only / all render routes
Mailto links: allowed / disallowed
Link domain allowlist: none / domains: ...
Limits approved: yes / changes: ...
Markdown profile approved: yes / changes: ...
Unknown fields rejected: yes / no
Render once plus toPlainText: yes / no
Shared shell scope approved: yes / changes: ...
Required inbox clients: ...
Additive rollout approved: yes / no
Future AST migration trigger approved: yes / no
```
