# React Email vs MJML for Markdown Email Architecture Plan

Date: 2026-07-27
Status: Architecture decision and follow-up implementation plan; no application code is changed by this assessment.

## Conversation Summary Through This Question

The initial request was to assess a direction where email body content is authored in Markdown, converted to email-safe HTML, and rendered inside a shared application email layout. The resulting assessment is recorded in `docs/20260727_markdown_email_content_and_shared_layout_plan.md`. It found that the direction is feasible with the existing React Email stack, but that API-provided Markdown must be treated as untrusted, the existing route schemas are not enforced at runtime, and React Email's installed `Markdown` component is unsafe for this input because it uses `marked` and `dangerouslySetInnerHTML` without sanitizing.

This follow-up asks whether the project should continue with React Email, replace it with MJML, or reimplement MJML-like behavior. The decision must account for the local React Email architecture and development workflow, Cloudflare Workers and Bun constraints, untrusted Markdown, email styling and CSS inlining, plain-text output, security, maintenance, and evidence from primary React Email and MJML sources. It also requests this new dated plan, a tradeoff comparison, sources, validation criteria, gotchas, and any proof-of-concept gates. Application code must not be modified during this research.

## Decision

**Continue React Email. Do not replace it with MJML and do not build an MJML-like compiler.**

Implement the requested direction later as a thin layer within the current architecture:

1. Enforce the Valibot request schema at runtime and bound the Markdown input before parsing.
2. Extract the repeated React Email document shell into a shared child-based layout.
3. Parse a deliberately small Markdown profile into an AST/React tree, with raw HTML disabled, an explicit element allowlist, and an explicit URL policy.
4. Map supported Markdown nodes to conservative, inline-styled React Email components or native email-safe elements inside the shared layout.
5. Keep `@react-email/render` as the single HTML and plain-text output boundary.

This is not a recommendation to reproduce MJML. React Email already supplies the useful abstraction level for this project: typed reusable components that emit email-oriented markup. Add only project-specific `EmailLayout` and `MarkdownContent` components. Do not create another markup language, transpiler, layout engine, CSS inliner, Outlook compatibility layer, or component registry.

MJML should be reconsidered only if real product requirements move from the current simple transactional, single-column shell to a substantial library of responsive multi-column marketing modules and comparative inbox testing demonstrates a material compatibility advantage that justifies migration and Worker costs.

## Decision Context

- The deployed product is a rendering microservice, not a static build pipeline. It receives JSON at request time and returns `subject`, `text`, and `html`.
- It runs both as a Bun server and a Cloudflare Worker. The README promises operation on the Workers free tier.
- Current templates, reusable parts, translations, tests, previews, and public API types are TypeScript/React.
- The requested body is API-provided Markdown and therefore untrusted regardless of caller authentication.
- The current designs are conservative transactional emails with a 600 px, mostly single-column container. They do not currently need MJML's strongest differentiator: a purpose-built responsive section/column transpiler.
- Existing behavior is already shipped. A framework replacement would require visual, semantic, localization, plain-text, and API regression work across all templates without directly solving Markdown trust.
- React Email and MJML both reduce email-markup complexity, but neither makes arbitrary untrusted Markdown safe by itself.

## Comparison Criteria

The alternatives are evaluated against:

- Fit with the current TypeScript/React architecture and migration cost.
- Proven Bun and Cloudflare Workers compatibility without adding runtime assumptions.
- Compressed Worker size, startup time, memory, and per-request CPU cost.
- Safe treatment of API-provided Markdown, raw HTML, links, images, and pathological input.
- Ability to produce robust email HTML, inline or otherwise compatible CSS, and Outlook-oriented markup.
- First-class plain-text generation from the same content.
- Local preview, typed composition, testability, and author workflow.
- Ongoing dependency, security, compatibility, and project-specific maintenance burden.
- Value for the actual single-column transactional layout rather than theoretical feature breadth.

## Tradeoff Matrix

| Criterion | Continue React Email | Replace with MJML | Reimplement MJML-like behavior |
| --- | --- | --- | --- |
| Current architecture fit | Best: already used end to end | Poor: migrate TSX templates and shared parts to MJML or maintain two systems | Superficially flexible, but creates a new internal framework |
| Worker evidence | Proven locally; renderer exposes `workerd`/`worker` exports | Standard compiler is Node-oriented; browser bundle is a separate unproven Worker dependency | Unknown until built; all compatibility work belongs to this project |
| Baseline bundle/CPU risk | Lowest incremental risk | Higher: parser, validator, component engine, CSS processors/inliner, and browser shims | Highest and permanent; compiler and client work must be maintained locally |
| Untrusted Markdown | Strong with AST-to-React mapping, raw HTML off, and URL allowlist | No inherent solution; Markdown must still be constrained/sanitized before insertion into an MJML ending tag | No inherent solution and more security-sensitive code to own |
| Styling/inlining | Existing Tailwind wrapper inlines supported utilities; Markdown mappings can use explicit inline styles | Strong generated responsive markup; `mj-style inline="inline"` uses the compiler's inlining path | Must recreate or integrate CSS parsing, inlining, and client-specific output |
| Responsive complex layouts | Adequate components, but requires disciplined client testing | Strongest option for semantic sections/columns and generated responsive/Outlook markup | Potentially strong only after substantial implementation and testing |
| Current simple layout | Already sufficient | Little incremental value | No incremental value |
| Plain text | Existing `render(..., { plainText: true })` path | MJML API documents HTML/JSON/errors, so a separate HTML-to-text path is still needed | Must design and maintain a text renderer or HTML-to-text conversion |
| Developer workflow | Existing `email dev`, TSX, `PreviewProps`, typed props, Bun tests | Good MJML CLI/editor ecosystem, but a different language/toolchain and lost direct TSX composition | New tooling, docs, preview behavior, diagnostics, and training required |
| Migration/regression risk | Low and incremental | High across six base templates/eight API registrations | Very high |
| Maintenance | Small project-specific adapter around maintained tools | Maintained upstream, but adds a second compiler ecosystem and migration surface | Worst: ownership of email-client quirks that dedicated frameworks exist to handle |
| Recommendation | **Choose** | Do not choose for current requirements | **Reject** |

## Local Findings and Architecture

### Existing Request and Render Path

The effective path is:

`POST JSON -> Hono route -> template-specific render function -> React Email TSX -> @react-email/render -> { subject, text, html }`

- `src/server/routes/addRoutesTemplates.ts` reads request JSON and calls `def.renderFn(body)` directly.
- `src/server/api/apiRouteDef.ts` registers eight public names against six underlying render/template implementations.
- `src/server/render/render*.tsx` renders each template twice: once with `{ plainText: true }` and once as HTML.
- `client/types/GeneratedEmailType.ts` defines the response contract to preserve.
- `src/server/worker.ts` and `src/server/server.ts` share the Hono application between Workers and Bun.

### Existing React Email Setup

- `package.json` currently pins React 19, React Email packages, Hono, Valibot, Bun tooling, and Wrangler. Scripts include React Email preview (`dev:email`), Bun development, Worker development, tests, build, and multi-target deployment.
- `src/templates/sign_in/SignInV1Template.tsx`, `src/templates/sign_up/SignUpV1Template.tsx`, `src/templates/invitation/InvitationV1Template.tsx`, `src/templates/password_change/PasswordChangeV1Template.tsx`, `src/templates/email_change/EmailChangeV1Template.tsx`, and `src/templates/invoice/InvoiceV1Template.tsx` repeat the outer `Html`, `Head`, `Preview`, `Tailwind`, `Body`, 600 px `Container`, and `Footer` structure.
- `src/template_parts/Footer.tsx`, `src/template_parts/LinkButton.tsx`, and `src/template_parts/CodeBlock.tsx` demonstrate the existing shared React component model.
- Each template exposes `PreviewProps`, matching the documented React Email preview workflow.
- `node_modules/@react-email/render/package.json` has explicit `workerd`, `worker`, browser, edge, and Node export conditions. This is stronger Workers evidence than a package merely being ESM or browser-capable.
- `node_modules/@react-email/markdown/dist/index.mjs` passes `marked.parse(...)` output to `dangerouslySetInnerHTML`. Its package depends on `marked`, whose own documentation warns that it does not sanitize output. It must not be used directly for this API input.

### Runtime and Deployment Constraints

- `wrangler.example.toml` and all active target configs use `src/server/worker.ts`, compatibility dates in October 2025, and no `nodejs_compat` flag.
- A local `wrangler 4.107.0 deploy --dry-run --config wrangler.example.toml` on 2026-07-27 succeeded at 3,147.86 KiB uncompressed and 713.50 KiB gzip.
- Cloudflare currently documents a 3 MB compressed Worker limit, 1 second startup limit, 128 MB memory limit, and 10 ms CPU time per HTTP request on the free plan. Markdown parsing and two render passes must fit the CPU budget at accepted maximum input size.
- Cloudflare documents that npm packages can depend on unsupported Node APIs. `nodejs_compat` supplies a mix of native APIs and polyfill stubs, and stubbed calls can still fail at runtime. The current project deliberately does not enable that compatibility surface.
- The standard MJML 5.4 compiler source imports Node `fs`, `path`, `process.cwd()`, config loading, Cheerio, Juice, PostCSS/cssnano, HTML processing, parsing, and validation. The `mjml-browser` build replaces or mocks Node-specific pieces and publishes a UMD compiler, but it is still a substantial compiler that has not been bundled or exercised in this Worker.
- The current Bun tests report 13 passing tests and 57 assertions, but the command did not exit before the 120-second harness timeout after reporting shutdown. This cleanup behavior should not be confused with a test assertion failure.
- `bun x tsc --noEmit -p tsconfig.json` currently fails because `@types/react`/JSX declarations are absent. This pre-existing baseline must be repaired or explicitly excluded from future feature acceptance.

### Validation Gap Before Markdown

`src/server/schemas/parts/stringSchema.ts` defines length-bounded schemas, and `src/server/api/apiRouteDef.ts` associates schemas with renderers, but `src/server/routes/addRoutesTemplates.ts` uses those schemas for OpenAPI description only. It does not parse the body with Valibot before rendering. Therefore, a Markdown schema alone would not enforce size or shape at runtime. Runtime validation is a prerequisite for either React Email or MJML and is more important to security than the choice between them.

## Recommended Target Architecture

`untrusted JSON -> runtime Valibot validation and size cap -> constrained Markdown parser -> safe AST/React node mapping -> shared React Email layout -> HTML and plain-text render`

The future shared layout should own `Html`, `Head`, `Preview`, `Tailwind`, `Body`, the 600 px content container, and `Footer`. It should accept React children plus explicit preview/footer properties. Markdown output must be an inner fragment, never a complete HTML document or a precompiled email.

The Markdown adapter should:

- Use `react-markdown` or a comparably small mdast pipeline, subject to an actual Worker bundle/CPU spike.
- Set `skipHtml` and use an explicit `allowedElements` list.
- Allow only the agreed syntax, initially paragraphs, `h2`-`h4`, emphasis, strong text, HTTPS/mailto links, ordered/unordered lists, block quotes, horizontal rules, line breaks, and plain inline/fenced code.
- Reserve `h1` for the template title and disable images, raw HTML, tables, forms, task inputs, embeds, SVG, and syntax highlighting initially.
- Apply an explicit URL transform narrower than library defaults; reject relative, protocol-relative, fragment, `javascript:`, `data:`, and other unapproved URLs.
- Map nodes to components/elements with explicit email-safe inline styles. Do not depend on Tailwind typography `prose`, complex selectors, or browser CSS inheritance.
- Produce both HTML and plain text through the existing render boundary, with focused text assertions for links, lists, headings, and code.

For defense in depth, `rehype-sanitize` with a project-specific schema can be placed after the last unsafe AST transform if plugins are introduced. The simpler initial design is to permit no raw HTML and no plugins that emit arbitrary HTML.

## Why Not MJML Now

- It solves a layout problem that the current single-column transactional designs do not have.
- It does not solve untrusted Markdown. MJML ending tags such as `mj-text` accept HTML content, so Markdown-derived content still needs a strict trust boundary before compilation.
- A full replacement discards working TSX templates, shared React parts, `PreviewProps`, the existing rendering path, and direct plain-text support.
- Keeping React for data/translation composition and then generating MJML introduces two component/render systems rather than simplifying one.
- Running the standard compiler per request adds Node-oriented and CSS/HTML compiler machinery to a free-tier Worker. `mjml-browser` is a possible technical experiment, not evidence that it meets this service's bundle and CPU budgets.
- Build-time MJML compilation does not fit dynamic request-time Markdown unless the runtime still performs Markdown conversion, insertion, sanitization, and text generation. It would also complicate per-request localization and template props.

MJML remains a credible framework in its intended domain. Its semantic section/column model, responsive output, Outlook-specific markup, CSS inlining support, component compatibility pages, CLI, and editor ecosystem are real strengths. They simply do not outweigh migration and runtime costs for this project's current direction.

## Why Not Reimplement MJML-like Behavior

The project should create reusable email components, but it should not recreate a transpiler. A custom MJML-like layer would require a markup grammar or AST, component validation, responsive table generation, conditional Outlook/VML markup, CSS transformation and inlining, diagnostics, preview tooling, accessibility conventions, and continual email-client regression work. That is a high-maintenance security and compatibility product unrelated to the service's core value.

`EmailLayout` and mapped Markdown components are normal application abstractions, not an MJML reimplementation. Keep this distinction explicit to prevent the thin adapter from evolving into an unsupported email framework.

## Security Requirements

- Treat every API Markdown string and URL as attacker controlled.
- Enforce JSON type, required fields, trimmed length, nesting/complexity assumptions, and a request body limit before parsing.
- Disable raw Markdown HTML rather than trying to make arbitrary HTML email-safe.
- Allowlist link schemes and decide whether redirects/tracking parameters require a separate policy. Displayed link text must not conceal an unapproved destination through transformation bugs.
- Escape text through React. Never concatenate caller input into HTML, MJML, CSS, attributes, or `dangerouslySetInnerHTML`.
- Do not expose React Email's `Markdown` component to request input. Styling its output does not sanitize it.
- Avoid caller-controlled inline styles, classes, IDs, image sources, template syntax, MJML, or plugin configuration.
- Add malicious fixtures for script/event-handler tags, malformed entities, encoded/obfuscated protocols, control/zero-width characters, deeply nested constructs, huge links, and oversized documents.
- Return bounded validation errors without reflecting dangerous content or internal parser details.
- Keep parser/sanitizer dependencies current and review their security advisories as part of dependency updates.

## Styling, Inlining, and Client Compatibility

- React Email components generate email-oriented markup, while `Tailwind` turns supported class utilities into inline styles. Its documentation warns that `rem` is unsupported in some email clients and offers `pixelBasedPreset`.
- React Email documents that Tailwind typography `prose`, complex selectors, and utilities such as `space-*` are not supported by its inlining approach. Markdown content therefore needs element-level mapped styles.
- MJML generates responsive tables, media queries, conditional Outlook markup, and can inline `mj-style` content through its compiler. This gives it an advantage for complex responsive designs, not automatic safety or universal rendering.
- Gmail's primary documentation supports style blocks, inline CSS, a subset of selectors/properties, and width/orientation/resolution media queries, while warning that unsupported CSS may be ignored. Other clients differ, so neither framework removes inbox testing.
- Use pixels for critical dimensions/type initially, retain the 600 px maximum, and test long unbroken content. Avoid flex, grid, complex selectors, CSS variables, and reliance on margins where table-cell padding is more robust.

## Plain-Text Direction

Keep the existing React Email plain-text path. React Email documents rendering HTML and converting it to text, and the installed renderer already provides `{ plainText: true }` backed by `html-to-text`. This keeps HTML and text derived from the same component tree.

Plain text still needs behavioral tests. Verify ordered and unordered list markers, link destinations, code readability, paragraph spacing, skipped preview-only content, Unicode, and long lines. A switch to MJML would not remove this work because MJML's documented compiler result is HTML/JSON/errors rather than a multipart text alternative.

## Developer Workflow and Maintenance

- Preserve TSX, typed props, existing translation helpers, reusable components, React Email's `email dev --dir=./src/templates`, and `PreviewProps`.
- Add one previewable Markdown-backed template with representative safe content and edge cases after the shared shell is stable.
- Prefer a small Markdown dependency and explicit mappings over a plugin collection. Every plugin increases syntax, security, bundle, and client-test scope.
- Extract only the shell shared by existing templates; do not force invoice-specific inner structure into a generic content DSL.
- Migrate templates to the shell incrementally with rendered-output regression checks.
- Record the supported Markdown profile as an API contract so callers do not infer GitHub or full CommonMark rendering support.

## Proof-of-Concept Validation Steps

These are implementation gates, not application changes made during this assessment.

1. Restore a clean TypeScript baseline by adding the project's intended React type declarations, or document an isolated temporary typecheck command for the spike.
2. Enforce Valibot parsing in the active Hono route and prove malformed/oversized requests return 400 before rendering.
3. Extract `EmailLayout` and compare normalized HTML and plain text for sign-in, invitation, and invoice templates before and after extraction.
4. Spike the smallest viable Markdown adapter with no raw HTML, no GFM plugin, an explicit element list, and HTTPS/mailto-only links.
5. Test malicious and malformed Markdown, including encoded protocols and raw HTML, and assert forbidden tags/attributes/URLs are absent from HTML and text.
6. Test representative 1 KiB content and the proposed maximum payload in Bun and `wrangler dev`; capture p50/p95 CPU time and memory behavior.
7. Compare `wrangler deploy --dry-run` against the recorded 713.50 KiB gzip baseline and keep substantial headroom under the 3 MB free limit.
8. Verify cold-start/deployment validation and actual Cloudflare production logs; a successful Bun import is not Workers proof.
9. Send rendered fixtures to Gmail web/mobile, Outlook web and classic Windows Outlook where supported, Apple Mail, and one additional mobile client. Cover dark mode, images off, large text, narrow width, long URLs, nested lists, and long localized text.
10. Verify the text alternative independently and inspect MIME assembly in the downstream sender, because this service returns content but does not send the multipart message.

If stakeholders still want MJML evidence, run an isolated, non-product spike after the React adapter baseline:

1. Compare standard `mjml` 5.4 and `mjml-browser` 5.4 in a minimal Worker without enabling `nodejs_compat` first.
2. Compile a fixed one-column document and a maximum-size Markdown-derived fragment with includes, raw MJML input, configuration loading, minification, and caller-controlled MJML all disabled.
3. Measure bundle gzip, startup, memory, and CPU, and prove identical behavior under Bun and workerd.
4. Compare inbox screenshots and output size against the React Email version.
5. Reconsider only if MJML produces a material, repeatable compatibility improvement for required layouts and remains inside runtime budgets. Mere successful compilation is insufficient.

## Validation Criteria

- Runtime request validation rejects wrong types and oversized Markdown before parsing.
- The supported Markdown profile renders deterministically; unsupported/raw HTML is omitted or escaped according to the documented contract.
- No script, event handler, style injection, form, iframe, SVG, tracking image, unsafe URL scheme, or caller-supplied attribute reaches output.
- Subject, preview, heading hierarchy, footer ownership, localization, and existing template behavior remain correct.
- HTML and plain text are both readable and preserve approved links and list ordering.
- Markdown styles are inline and conservative; output remains within the 600 px shell and handles long URLs/code without destructive overflow.
- Existing Bun API/OpenAPI/client tests pass and terminate cleanly; focused Markdown/security tests are added.
- Typecheck has a known clean baseline.
- Worker dry-run, local workerd execution, and production smoke tests pass without requiring unplanned Node compatibility flags.
- Bundle, startup, CPU, and memory stay within free-tier limits with documented headroom at maximum accepted input.
- Required inbox clients pass visual and functional review; framework claims are not accepted as a substitute for project-specific messages.

## Gotchas

- `@react-email/markdown` being installed and documented does not make it safe for untrusted content. Its current implementation is an HTML injection boundary.
- A sanitizer is only effective at the right stage. Unsafe transforms after sanitization can reintroduce dangerous nodes.
- URL checks must handle case, whitespace/control characters, encoding, and parser normalization. A simple `startsWith("https")` check is inadequate.
- Markdown parsing can amplify small input into larger HTML and CSS. Bound source length and inspect rendered size to reduce CPU/memory and Gmail clipping risk.
- React Email Tailwind classes are not ordinary browser Tailwind. `prose`, complex selectors, and some units/utilities do not inline as callers may expect.
- MJML's `mj-text`, `mj-button`, and other ending tags can contain HTML. MJML validation is not HTML sanitization.
- MJML's standard Node compiler and browser bundle have different runtime assumptions and capabilities. Testing one does not prove the other.
- Enabling `nodejs_compat` can make imports succeed while some APIs remain nonfunctional stubs. Exercise executed code paths.
- Rendering the same React tree twice is current behavior. Maximum-size Markdown must be benchmarked across both HTML and text passes.
- Plain-text conversion is lossy by nature; visual HTML success says nothing about link/list readability in text.
- Classic Outlook, web Outlook, and new Outlook are different rendering targets. A generic "Outlook passed" result is underspecified.
- Gmail and other clients may clip large messages; generated HTML size matters independently from Worker response limits.
- Shared layout extraction can accidentally alter preview text, Tailwind traversal, body/background placement, footer spacing, or alternate invoice variants.
- The README states Valibot validation exists, but the active template route currently does not enforce it. Do not rely on OpenAPI schema generation as runtime validation.
- The existing TypeScript declaration failure and Bun test-process cleanup timeout are baseline issues to separate from feature regressions.

## Relevant Local File Locations

- Prior assessment: `docs/20260727_markdown_email_content_and_shared_layout_plan.md`
- Dependencies/scripts: `package.json`, `bun.lock`
- Runtime/compiler config: `tsconfig.json`, `tsconfig.lib.json`
- Worker configs: `wrangler.example.toml`, `wrangler.david.toml`, `wrangler.leg-tj.toml`, `wrangler.leo.toml`, `data/wrangler.toml`
- Worker/Bun entries: `src/server/worker.ts`, `src/server/server.ts`, `src/server/hono.ts`
- Route and registry: `src/server/routes/addRoutesTemplates.ts`, `src/server/api/apiRouteDef.ts`, `src/server/api/ApiRouteDefType.ts`
- Render boundary: `src/server/render/render*.tsx`
- Templates: `src/templates/*/*Template.tsx`
- Shared parts: `src/template_parts/Footer.tsx`, `src/template_parts/LinkButton.tsx`, `src/template_parts/CodeBlock.tsx`
- Schemas: `src/server/schemas/*.ts`, `src/server/schemas/parts/stringSchema.ts`
- Public contracts: `client/types/`, `client/emailTemplateName.ts`, `client/types/GeneratedEmailType.ts`
- Tests: `test/apiSignIn.test.ts`, `test/apiInvoice.test.ts`, `test/openapi.test.ts`, `test/clientImports.test.ts`, `test/workerCache.test.ts`, `test/setup.ts`
- Installed React Email implementation evidence: `node_modules/@react-email/render/package.json`, `node_modules/@react-email/markdown/package.json`, `node_modules/@react-email/markdown/dist/index.mjs`

Illustrative later files, subject to repository naming conventions, are `src/template_parts/EmailLayout.tsx`, `src/template_parts/MarkdownContent.tsx`, one Markdown-backed template under `src/templates/`, one renderer under `src/server/render/`, one runtime-enforced schema under `src/server/schemas/`, and matching `client/types`/API registration files.

## Online Primary Sources

### React Email

- Introduction and tested component model: https://react.email/docs/introduction
- Render and plain-text utilities: https://react.email/docs/utilities/render
- Markdown component API: https://react.email/docs/components/markdown
- Tailwind inlining behavior, pixel preset, and limitations: https://react.email/docs/components/tailwind
- CLI, preview workflow, `PreviewProps`, and render-vs-export guidance: https://react.email/docs/cli
- Current renderer package export conditions/source repository: https://github.com/resend/react-email/tree/main/packages/render
- Current React Email source repository: https://github.com/resend/react-email

### MJML

- Official guide, Node/browser usage, compiler options, includes, components, ending tags, styles, validation, and API result: https://documentation.mjml.io/
- Official repository and source: https://github.com/mjmlio/mjml
- Official component compatibility index: https://mjml.io/compatibility
- Current releases, including MJML 5.4.0: https://github.com/mjmlio/mjml/releases
- Standard compiler package manifest: https://github.com/mjmlio/mjml/blob/master/packages/mjml/package.json
- Compiler core manifest and source: https://github.com/mjmlio/mjml/tree/master/packages/mjml-core
- Browser compiler manifest/build: https://github.com/mjmlio/mjml/tree/master/packages/mjml-browser

### Runtime and Security

- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Workers Node.js/npm compatibility and stub caveat: https://developers.cloudflare.com/workers/runtime-apis/nodejs/
- `react-markdown` AST, component mapping, allowed elements, URL transform, raw HTML, and security guidance: https://github.com/remarkjs/react-markdown
- `rehype-sanitize` schema, ordering, and security guidance: https://github.com/rehypejs/rehype-sanitize
- Marked's explicit no-sanitization warning: https://marked.js.org/
- Gmail's official CSS support reference: https://developers.google.com/gmail/design/css

## Sequenced Overall Plan

1. Accept this decision and document the supported Markdown profile and URL policy as API requirements.
2. Fix the baseline type declarations and test-process cleanup independently.
3. Add runtime schema enforcement and request/Markdown size limits.
4. Extract and regression-test the shared React Email layout.
5. Run the constrained Markdown adapter spike and Worker performance measurements.
6. Add the Markdown-backed API/template only after security and runtime gates pass.
7. Complete plain-text, malicious-input, localization, and inbox-client validation.
8. Revisit MJML only when concrete responsive-layout requirements and comparative test evidence justify it; never build an in-house MJML replacement.
