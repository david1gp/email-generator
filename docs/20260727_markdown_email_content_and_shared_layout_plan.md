# Markdown Email Content and Shared Layout Assessment Plan

Date: 2026-07-27
Status: Feasibility assessment only; no product implementation is included in this work.

## Request and Conversation Summary

Assess whether this service can support authoring email body content in Markdown, converting that content into email-safe HTML, and rendering it within the application's shared email layout/app shell. The assessment must inspect the local repository and credible online primary documentation, identify a suitable architecture and limitations, and call out email-client compatibility and security concerns.

The requested deliverables are this plan, a map of relevant project architecture and files, a feasibility conclusion and recommended architecture, the online sources consulted, and recommended next steps. Product code must not be implemented during the assessment.

## Goals

- Determine how Markdown input should enter the existing typed API and rendering pipeline.
- Determine how Markdown can be parsed into content that composes safely with React Email.
- Identify the reusable layout boundary currently duplicated by templates.
- Preserve the existing `subject`, plain-text `text`, and rendered `html` response contract.
- Define security, email-client compatibility, testing, and operational requirements before implementation.
- Prefer the smallest architecture that works in both Bun and Cloudflare Workers.

## Rationale

Markdown would let authors maintain long-form email content without hand-writing React Email component trees. Reusing one shell would keep global background, width, typography, spacing, preview text, and footer behavior consistent. The conversion cannot be treated like ordinary browser HTML rendering: email clients support a constrained and inconsistent HTML/CSS subset, untrusted Markdown can produce unsafe links or HTML, and arbitrary generated tags do not automatically gain React Email's compatibility behavior.

## Current Architecture and Likely File Locations

Repository inspection confirms a TypeScript/React 19 service using React Email, Hono, Valibot, Bun, and Cloudflare Workers. There is no shared shell component today; the visual shell is repeated in six base templates.

- `src/templates/*/*Template.tsx`: email template components. Existing templates duplicate the outer React Email shell (`Html`, `Head`, `Preview`, `Tailwind`, `Body`, a 600 px `Container`, and `Footer`).
- `src/template_parts/`: existing reusable presentation components such as `Footer`, `LinkButton`, and `CodeBlock`; this is a likely home for a shared email layout and Markdown-content renderer if they are shared by multiple templates.
- `src/server/render/render*.tsx`: template-specific render functions using `@react-email/render`, producing HTML and plain text.
- `src/server/schemas/`: Valibot request validation; a Markdown-backed template would require bounded string fields and metadata validation here.
- `src/server/api/apiRouteDef.ts` and `src/server/routes/addRoutesTemplates.ts`: endpoint registry and route/OpenAPI wiring.
- `client/types/` and `client/apiGenerateEmail*.ts`: public request/response types and API client wrappers.
- `client/types/GeneratedEmailType.ts`: existing generated-email contract to preserve.
- `test/api*.test.ts`, `test/openapi.test.ts`, and template preview props: likely validation points for API behavior, snapshots/assertions, and visual development.
- `package.json`: dependency/runtime constraints and scripts; any Markdown parser, sanitizer, or AST tooling must be compatible with ESM, Bun, and the Cloudflare Workers runtime.
- `node_modules/@react-email/markdown` (installed transitively through `@react-email/components`): an immediately available Markdown renderer based on `marked`, but not safe for untrusted request content without an external sanitization boundary.

Likely future files, if a dedicated Markdown template is chosen, are `src/template_parts/EmailLayout.tsx`, `src/template_parts/MarkdownContent.tsx`, `src/templates/markdown/MarkdownV1Template.tsx`, `src/server/render/renderMarkdownV1.tsx`, `src/server/schemas/markdownV1Schema.ts`, `client/types/MarkdownV1Type.ts`, and `client/apiGenerateEmailMarkdownV1.ts`. Registration would also touch `client/emailTemplateName.ts`, `client/index.ts`, and `src/server/api/apiRouteDef.ts`. Names are illustrative and should follow the decision about a new endpoint versus Markdown fields on an existing template.

## Proposed Assessment and Implementation Approach

1. Trace one representative request from client type and Valibot schema through route registration, server render function, React Email template, and generated response.
2. Compare all templates to establish the exact shared-shell contract and identify intentional variants such as attachment/invoice layouts.
3. Evaluate Markdown conversion strategies against the runtime and email constraints:
   - Recommended for API-supplied or otherwise untrusted content: use `react-markdown` or a small unified/mdast pipeline, disable raw HTML, allow only an explicit element set, enforce URL protocols, and map nodes to styled React Email components or conservative native elements. This avoids `dangerouslySetInnerHTML` and keeps the content inside the React Email render tree.
   - Minimal trusted-author option: use the already installed React Email `Markdown` component with explicit inline `markdownCustomStyles`. Its implementation calls `marked.parse(...)` and injects the result with `dangerouslySetInnerHTML`; `marked` explicitly does not sanitize output. A local probe confirmed that raw `onerror` markup and `javascript:` links survive rendering, so this option must not receive arbitrary API content.
   - Fallback: parse to an HTML fragment and sanitize against a strict email-specific schema before insertion. This adds a second HTML pipeline and is less attractive than producing React nodes directly.
4. Design a shared layout component that owns document-level elements and accepts preview text, footer properties, and React content as children. Markdown rendering should produce only inner content, never a second HTML document/body.
5. Preserve a first-class plain-text output. Prefer a Markdown-aware text path or validate React Email's `plainText` rendering rather than stripping generated HTML ad hoc.
6. Define a narrow supported Markdown profile, likely paragraphs, headings, emphasis, strong text, links, ordered/unordered lists, block quotes, horizontal rules, and inline/fenced code. Decide explicitly whether raw HTML, images, tables, task lists, and embedded content are disabled or specially mapped.
7. Define URL protocols, raw-HTML handling, input-size limits, sanitization/escaping, and trusted-versus-untrusted author assumptions.
8. Validate parser and renderer bundle/runtime compatibility with Bun and Cloudflare Workers before selecting dependencies.
9. Implement incrementally only in a later task: shared shell first, then Markdown rendering, then one new template/endpoint or one controlled migration.

## Assessment Findings and Decisions

- Feasibility: yes. React Email already owns complete HTML and plain-text generation, and the Markdown body can be a child of a newly extracted shell.
- Shared-shell boundary: the shell should own `Html`, `Head`, `Preview`, `Tailwind`, `Body`, the 600 px main `Container`, and `Footer`. It should accept `children`; it should not accept prebuilt complete HTML or another `Html`/`Body` tree.
- Content policy: start with paragraphs, `h2`-`h4` headings, emphasis, strong text, HTTPS/mailto links, ordered and unordered lists, block quotes, horizontal rules, line breaks, and plain code. Reserve the single `h1` for the template title. Disable raw HTML, images, tables, task-list inputs, embedded content, and syntax highlighting until separately designed and client-tested.
- Styling: use explicit inline styles in the Markdown node mapping. React Email documents that Tailwind's typography `prose` and complex selectors are unsupported, and some clients do not support Tailwind's default `rem` units. The shell may continue using its existing Tailwind classes; a future migration can consider `pixelBasedPreset`.
- Plain text: continue generating it from the same rendered React tree with `@react-email/render`'s plain-text mode, then add assertions for list markers, code, and link destinations.
- Validation: the active Bun and Worker path is Hono's `addRoutesTemplates`, which currently reads JSON and directly calls `def.renderFn`. The Valibot schema is used for OpenAPI but not runtime validation on this path. A local request accepted and rendered a 1,000-character `code` despite `stringSchema` imposing 100 characters. Runtime schema validation, a dedicated Markdown size cap, and URL policy are prerequisites.
- Runtime: the current Worker completes a Wrangler dry run at about 713.5 KiB gzip, below Cloudflare's documented 3 MiB free-plan compressed limit. Any new parser must be measured in the actual Worker bundle and exercised under the free plan's 10 ms CPU budget; pure ESM does not by itself prove Workers compatibility.
- Existing validation baseline: `bun x tsc --noEmit -p tsconfig.json` currently fails because React JSX type declarations are absent. This pre-existing issue should be fixed or explicitly separated before using typecheck success as feature acceptance.

## Validation Criteria

- Existing templates retain equivalent subjects, HTML structure, plain-text output, localization, and footer behavior after any future shell extraction.
- Markdown syntax in the supported profile renders to semantically correct React Email/HTML structures without nested document elements.
- Text and HTML output are both readable and preserve links and list ordering.
- Markdown control characters and embedded HTML cannot inject scripts, event handlers, styles, forms, iframes, tracking elements, or unsafe URL protocols.
- Links are normalized/validated and use email-appropriate styling; long URLs wrap without breaking the 600 px container.
- Rendered HTML is complete, includes preview text, and has email-compatible styles inlined or emitted as supported by React Email.
- Representative output is tested in Gmail, Outlook desktop/web, Apple Mail, and a mobile client, using a service or real-client matrix where possible.
- Dark mode, images-off mode, high text scaling, long localized copy, narrow screens, and Outlook-specific rendering are reviewed.
- The selected Markdown stack works in both `bun test`/Bun server and `wrangler`/Cloudflare Workers and stays within bundle/CPU limits.
- Existing API/OpenAPI and package-client tests pass; new schema and renderer behavior has focused tests, including malicious input cases.

## Email-Client Gotchas and Risks

- Email HTML is not browser HTML. CSS support varies substantially, with classic Windows desktop Outlook versions historically relying on Microsoft Word rendering behavior.
- Layout should remain table-oriented through React Email components where appropriate; arbitrary Markdown-generated block HTML may need explicit inline styles for predictable margins, typography, lists, and code blocks.
- `<style>`, modern selectors, flex/grid, media queries, shorthand properties, and dark-mode behavior are inconsistently supported. Tailwind output must be checked rather than assumed safe.
- Gmail and other providers may clip messages near size limits; parser output and inlined CSS can increase message size.
- Raw Markdown HTML and unsafe protocols (`javascript:`, unsafe `data:` forms) are injection/phishing risks. Escaping is mandatory, while sanitization is required if any raw HTML is accepted.
- Images need absolute HTTPS URLs, dimensions, useful `alt` text, and graceful blocked-image behavior. Remote image loading also has privacy/tracking implications.
- Tables, code blocks, long unbroken strings, and long URLs can overflow on mobile or Outlook. Syntax highlighting is likely too CSS-heavy unless tightly constrained.
- Relative URLs, fragment-only links, embedded SVG, forms, video, iframe, and script content should not be accepted by default.
- Plain-text generation can lose Markdown link destinations, list markers, or code formatting unless explicitly tested.
- User-supplied Markdown can cause denial-of-service via very large input or pathological nesting; schemas should impose length limits and the parser should avoid unsafe extensions.
- Reusing a shell requires care around preview/preheader text, heading hierarchy, footer ownership, localization, and templates with alternate structures or attachments.

## Primary Documentation and Resources Consulted

- React Email Markdown component: https://react.email/docs/components/markdown
- React Email render and plain-text utilities: https://react.email/docs/utilities/render
- React Email Tailwind behavior and known limitations: https://react.email/docs/components/tailwind
- React Email HTML document component: https://react.email/docs/components/html
- `react-markdown` architecture, component mapping, URL transform, raw HTML, and security guidance: https://github.com/remarkjs/react-markdown
- remark AST model, HTML pipeline, security, and input-size guidance: https://github.com/remarkjs/remark
- rehype sanitization schema and ordering guidance: https://github.com/rehypejs/rehype-sanitize
- Marked security warning and specification support: https://marked.js.org/
- Marked options, including removal of its old sanitizer option: https://marked.js.org/using_advanced#options
- CommonMark 0.31.2 specification: https://spec.commonmark.org/0.31.2/
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Workers Node.js/npm compatibility: https://developers.cloudflare.com/workers/runtime-apis/nodejs/
- Gmail's official CSS support reference: https://developers.google.com/gmail/design/css
- Community-maintained email-client compatibility data for `rem` and flexbox: https://www.caniemail.com/features/css-unit-rem/ and https://www.caniemail.com/features/css-display-flex/

## Recommended Next Steps

1. Decide whether Markdown is immutable, trusted repository content or caller-supplied API content, and whether it belongs in a new generic endpoint or one specific template. Default to the untrusted design for API input.
2. Restore a clean typecheck baseline and enforce each route's Valibot schema at runtime before adding a large Markdown field.
3. Extract the repeated document shell into a child-based `EmailLayout`, with regression assertions against at least sign-in, invitation, and invoice output before changing content rendering.
4. Run a small implementation spike with `react-markdown`: no raw HTML, an explicit allowed-element list, HTTPS/mailto URL policy, inline-styled node mappings, and no GFM extensions initially. Keep React Email's installed `Markdown` component only as a benchmark or trusted-content shortcut.
5. Add malicious-input, size-limit, HTML, plain-text, heading-hierarchy, long-link, and localization tests. Record generated HTML fixtures for review without overfitting tests to irrelevant serializer whitespace.
6. Measure `wrangler deploy --dry-run` bundle size and rendering CPU for representative and maximum Markdown payloads, then test actual messages in the agreed Gmail, Outlook, Apple Mail, and mobile matrix.
7. Add images, tables, task lists, or syntax highlighting only as separate capabilities with explicit URL/layout rules and client evidence.

## Expected Assessment Output

- Confirmed architecture/file map.
- A feasible/not-feasible conclusion with a recommended conversion boundary and dependency category.
- Explicit limitations and a supported Markdown profile.
- Primary documentation and compatibility sources with URLs.
- Sequenced implementation and validation recommendations for a later task.
