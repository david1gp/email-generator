# Trusted Markdown Email Descendant Styling Follow-Up Plan

Date: 2026-07-27
Status: Research, recommendation, and future implementation plan only. No application code is implemented by this document.

## Complete Conversation Summary

The first request assessed Markdown-authored email bodies rendered inside a shared application email layout. Repository and online research established that the service already uses React Email end to end, repeats its outer shell across templates, returns HTML and plain text, and runs in Bun and Cloudflare Workers. It recommended a small Markdown profile, runtime request validation, a shared child-based layout, explicit URL and HTML policy, and client testing. That work is recorded in `docs/20260727_markdown_email_content_and_shared_layout_plan.md`.

The next follow-up compared keeping React Email, replacing it with MJML, and building an MJML-like compiler. It decided to keep React Email because the current emails are simple, mostly single-column transactional layouts; React Email is already integrated with TSX, previews, renderers, Workers, and tests; MJML would not make Markdown safe; and an internal email compiler would add unjustified compatibility and maintenance ownership. That decision is recorded in `docs/20260727_react_email_vs_mjml_markdown_architecture_plan.md`.

The next clarification established that the Markdown is authored solely by the user. The resulting plan made React Email's built-in `Markdown` component a proportionate option only when trusted authorship is preserved through trusted delivery, no untrusted values are interpolated into the Markdown, and policy/review rather than technical rejection of raw HTML is acceptable. It retained an AST-to-React renderer as the required option if the trust boundary broadens or technical enforcement is required. That work is recorded in `docs/20260727_trusted_author_react_email_markdown_architecture_plan.md`.

This follow-up addresses the remaining styling concern: whether Markdown-generated child elements can reliably receive typography and spacing from a containing `div` through descendant selectors, especially when the containing email already uses React Email's `Tailwind` component. It asks for evidence from the installed implementation and major email clients, an exact account of unsafe selectors and styles, and a recommendation among built-in React Email Markdown with direct style mapping, custom Markdown AST/component mapping, and no Markdown. Application code must not be changed.

## Question And Short Answer

**Question:** Is styling generated Markdown children through selectors such as `.markdown p`, `.markdown h2`, Tailwind `prose`, `[&_p]:...`, or `space-y-*` dependable in HTML email?

**Answer:** Not as the source of critical styling. A plain descendant selector has materially broader support than many modern CSS features, but it still depends on a retained and correctly placed `<style>` block and on each client applying the selector. Caniemail estimates 87.81% support including partial support for the descendant combinator and only 78.26% including partial support for the `<style>` element. Gmail mobile has account-dependent `<style>` and selector support, classic Outlook has style-order and CSS-property limitations, and Yahoo Android has documented head handling problems. Inline styles avoid the selector and style-block failure modes, although they cannot make an unsupported property work.

React Email adds a separate decisive limitation: its `Tailwind` component does not support `prose` or selectors more complex than a single class lookup, including `space-*`. The built-in `Markdown` component emits its parsed children through `dangerouslySetInnerHTML`, so those children are not React elements that Tailwind can visit and inline. A local probe against the installed versions confirmed that a Tailwind arbitrary descendant variant did not target the generated paragraph and was instead inlined on the outer wrapper.

For this trusted-author use case, retain the built-in React Email `Markdown` option, but style each supported Markdown element with complete, conservative, pixel-based `markdownCustomStyles`. Use `markdownContainerStyles` only for wrapper properties and optional inherited baseline typography, never as the sole styling mechanism. Do not use Tailwind descendant variants, `prose`, `space-*`, or critical head selectors for Markdown children.

Choose a custom AST/component map instead if styling must use project React components, the syntax and URL policy must be technically enforced, unsupported nodes must be rejected, raw HTML must be impossible, or element behavior needs more control than the built-in style keys expose. Choose no Markdown if the body remains fixed, highly structured, personalized, or dominated by buttons, rows, cards, and invoice data rather than long-form prose.

## Recommendation

The recommended decision for the currently stated trusted Markdown is:

1. Keep React Email and the existing `Tailwind` wrapper for the shell and existing React elements.
2. Use React Email's built-in `Markdown` only behind the trusted-author/trusted-delivery boundary already defined in the prior plan.
3. Apply a complete `markdownCustomStyles` object directly to every enabled Markdown element.
4. Use pixels for critical typography and spacing and literal colors rather than `rem`, CSS variables, or browser defaults.
5. Use `markdownContainerStyles` for wrapper padding/background/font baseline only; repeat critical typography on generated elements.
6. Treat all selectors in a `<style>` block as progressive enhancement, not required formatting.
7. Do not put `prose`, `[&_p]:...`, `[&_h2]:...`, `space-y-*`, child/sibling variants, or similar classes on a wrapper expecting React Email Tailwind to map them onto Markdown output.
8. Keep raw HTML, images, tables, task controls, embeds, and syntax highlighting out of version 1.
9. Move to a custom AST/component map before broadening trust or when project-specific components and enforceable element policy become requirements.

This recommendation is narrower than saying descendant selectors never work. They work in many major clients, including tested versions of Apple Mail, Gmail, Outlook, and Yahoo, but are less dependable than direct inline declarations and are not processed correctly for this use case by React Email Tailwind.

## Actual Local Architecture And Files

### Runtime And Dependencies

- `package.json` defines React 19, `@react-email/components` `^1.0.12`, `@react-email/render` `^2.0.10`, React Email preview tooling, Hono, Valibot, Bun, and Wrangler.
- `package.json` exposes `dev:email`, `dev:bun`, `dev:worker`, `test`, `build`, and deploy scripts.
- The installed Markdown implementation is `@react-email/markdown` `0.0.18` in `node_modules/@react-email/markdown/package.json`.
- The installed Tailwind implementation is `@react-email/tailwind` `2.0.7` in `node_modules/@react-email/tailwind/package.json` and uses Tailwind CSS `^4.1.18`.
- `src/server/server.ts` and `src/server/worker.ts` use the same Hono application for Bun and Cloudflare Workers.
- `src/server/routes/addRoutesTemplates.ts` is the active generic request-to-render path.
- `src/server/api/apiRouteDef.ts` and `src/server/api/ApiRouteDefType.ts` register template names, schemas, and renderers.
- `src/server/render/render*.tsx` is the current HTML/plain-text render boundary.
- `client/types/GeneratedEmailType.ts` defines the `{ subject, text, html }` contract that future work must preserve.

### Current Presentation Architecture

- `src/templates/sign_in/SignInV1Template.tsx` and `src/templates/invoice/InvoiceV1Template.tsx` are representative templates.
- `src/templates/sign_up/SignUpV1Template.tsx`, `src/templates/invitation/InvitationV1Template.tsx`, `src/templates/password_change/PasswordChangeV1Template.tsx`, and `src/templates/email_change/EmailChangeV1Template.tsx` use the same general shell.
- `src/templates/org_invitation/OrgInvitationV1Template.tsx` and `src/templates/team_invitation/TeamInvitationV1Template.tsx` are additional template variants.
- The repeated shell is `Html`, `Head`, `Preview`, `Tailwind`, `Body`, a maximum 600 px bordered `Container`, content, and `Footer`.
- `src/templates/invoice/InvoiceV1PaidAttachment.tsx`, `src/templates/invoice/InvoiceV1UnpaidAttachment.tsx`, and `src/templates/invoice/InvoiceV1UnpaidWithLink.tsx` wrap the invoice template as preview/behavior variants.

### Existing Styling Patterns

- Templates put simple Tailwind utilities directly on real React Email elements such as `Body`, `Container`, `Heading`, `Section`, `Text`, `Link`, `Row`, and `Column`.
- Representative simple classes include `bg-gray-50`, `max-w-[600px]`, `text-2xl`, `text-lg`, `font-semibold`, `mt-1`, `mb-1`, `p-4`, borders, and literal-color utilities.
- No inspected template uses `prose`, arbitrary descendant variants, structural pseudo-selectors, or `space-*` for its critical content styling.
- `src/template_parts/Footer.tsx` uses element-level Tailwind classes on `Container`, `Text`, and `Link`.
- `src/template_parts/LinkButton.tsx` uses a direct inline `buttonStyle` for background, radius, weight, color, decoration, alignment, display, and padding, with an optional class on the same link.
- `src/template_parts/CodeBlock.tsx` uses a direct inline `codeStyle` for family, weight, padding, background, pixel font size, radius, and color, with an optional class on the same code element.
- `src/utils/classArr.ts` combines simple class strings for existing React elements.

The local architecture therefore already uses the reliable pattern for exceptional components: direct inline styles on the element that needs them. Markdown styling should follow that pattern through an element style map rather than introduce a container-selector dependency.

### Relevant Tests And Baselines

- `test/apiSignIn.test.ts` and `test/apiInvoice.test.ts` exercise representative render routes.
- `test/openapi.test.ts` covers generated API documentation.
- `test/clientImports.test.ts` protects the published client import boundary.
- `test/workerCache.test.ts` covers Worker response caching behavior.
- `test/apiVersion.test.ts` covers the version endpoint.
- Prior research found that schemas registered for OpenAPI are not currently enforced before rendering and that the TypeScript baseline lacks React JSX declarations. Those constraints remain prerequisites for future Markdown application work but are not modified here.

## Installed React Email Behavior

### Built-In Markdown

`node_modules/@react-email/markdown/dist/index.mjs` confirms that the installed component:

- Parses with `marked.parse` and a custom Marked `Renderer`.
- Inserts the generated string into one `div` with `dangerouslySetInnerHTML`.
- Applies `markdownContainerStyles` directly to the wrapping `div`.
- Shallowly replaces each matching default style entry with the supplied `markdownCustomStyles` entry.
- Serializes numeric dimensions such as `fontSize`, margin, padding, and radius to pixel values.
- Writes mapped styles directly into the generated tags as `style` attributes.
- Exposes mappings for `h1`-`h6`, `blockQuote`, `bold`, `italic`, `link`, `codeBlock`, `codeInline`, `p`, `li`, `ul`, `ol`, `image`, `br`, `hr`, table elements, and `strikethrough`.

Important installed-version details:

- Default headings use `rem`, which should be completely overridden for classic Outlook compatibility.
- Default block quotes use `em` spacing and the `background` shorthand; conservative custom values should use pixels and `backgroundColor`.
- A custom style entry replaces, rather than merges with, that element's default entry. Every custom entry must be complete.
- `codeBlock` is applied to the outer `pre`; the nested `code` receives no independent block mapping.
- Raw authored HTML passes through Marked's raw HTML path and does not automatically receive the Markdown element mappings.
- Although the type declares a `th` style, the installed renderer applies the `td` style while emitting both header and data cells. Tables are already deferred, so this should be treated as another reason not to promise table styling with the built-in version.
- `MarkdownProps` exposes only `children`, `markdownContainerStyles`, `markdownCustomStyles`, and `ref`; it does not expose a typed class-name styling contract for descendant CSS.

### Tailwind

React Email's current Tailwind documentation and the installed package readme state that the main purpose is to inline styles because class and `<style>` support is weaker in email. Media queries are the exception and remain in a `<style>` element in the head.

The documentation explicitly says:

- `prose` from `@tailwindcss/typography` is unsupported.
- Selectors more complex than a class lookup cannot currently be matched and inlined to elements.
- `space-*` is unsupported for the same reason.
- Media-query classes remain in a style block because media queries cannot be inlined.
- Hover styles are not handled as a reliable exception and have weak client support.
- Default Tailwind `rem` values are unsupported by some clients; `pixelBasedPreset` exists to replace the root-relative scale with pixels.

### Local Render Probes

Two temporary `bun -e` probes rendered React trees without changing repository files.

The direct mapping probe used `markdownContainerStyles` plus `markdownCustomStyles` for `p`, `h2`, and `link`. The rendered result placed literal inline declarations on every mapped generated element:

```html
<div data-id="react-email-markdown" style="color:#111827;font-family:Arial">
  <h2 style="font-size:24px;line-height:32px;margin:24px 0 12px">Heading</h2>
  <p style="font-size:18px;line-height:28px;margin:0 0 16px">
    Paragraph with <a style="color:#2563eb;text-decoration:underline">link</a>.
  </p>
</div>
```

The Tailwind wrapper probe used `text-red-500 [&_p]:text-blue-500 space-y-4` around built-in Markdown. The rendered result put the blue color on the outer wrapper, did not put a style on the generated paragraph, and emitted no spacing styles. This exactly matches React Email's warning that complex selectors are not matched against child elements. It also demonstrates that a browser preview can look partly acceptable through inheritance while the intended selector semantics and spacing are absent.

## Online Research Findings

### Selector And Style-Block Compatibility

The following Caniemail figures are broad estimates based on tested clients, not guarantees for a project's exact message or future client versions:

| Feature | Estimated support including partial | Material caveat |
| --- | ---: | --- |
| Descendant combinator `.markdown p` | 87.81% | Gmail iOS/Android partial for non-Google accounts; some providers only support particular selector forms |
| Child combinator `.markdown > p` | 75.61% | Same Gmail account caveat; less support than descendant |
| Adjacent sibling `h2 + p` | 82.93% | Same Gmail account caveat; some providers require class/ID forms |
| Class selector | 87.81% | Still depends on retained CSS; Gmail non-Google-account and Yahoo Android caveats |
| Type selector | 82.93% | Same style-block/client caveats |
| `<style>` element | 78.26% | Gmail does not support it in the body, mobile non-Google accounts are partial, Gmail limits a style tag to 16 KB, classic Outlook requires rules before use, and Yahoo Android has head handling bugs |

Google's current official Gmail documentation says Gmail supports inline style blocks and standard CSS, but only a subset of selectors and properties; its selector section explicitly promises class, element, and ID selectors and warns that unsupported CSS may be ignored. A descendant selector therefore has useful compatibility evidence but is not as strong a contract as a directly inlined declaration.

### Major Client Interpretation

- **Gmail web:** Simple head selectors generally work and Gmail officially supports class, element, and ID selectors. Inline remains safer because unsupported selectors/properties may be ignored and style tags have size/placement limits.
- **Gmail iOS/Android:** Caniemail marks selector and style-block support partial for non-Google accounts. A message read through the Gmail app is not always using the same rendering path as a Gmail account.
- **Apple Mail macOS/iOS:** Descendant and style-block support is strong in the tested versions. It is not the limiting client for this decision, though link rewriting, dark mode, and word-wrapping behavior still require tests.
- **Classic Outlook for Windows:** Tested versions support descendant selectors and style blocks, but the Word-based CSS surface makes many declarations unreliable regardless of selector support. Style elements must occur before affected content. `rem`, flex, grid, `overflow-wrap`, `word-break`, inline `!important`, and rounded corners have absent or partial behavior.
- **New Outlook, Outlook.com, Outlook mobile, and Outlook for macOS:** These are separate rendering targets with generally broader web CSS behavior. Passing one Outlook variant does not prove classic Windows Outlook.
- **Yahoo Mail:** Most tested variants support selectors, but Yahoo Android has documented first-head handling behavior; style retention cannot be assumed from desktop webmail results.

### Property Compatibility Relevant To Markdown

| Property or mechanism | Evidence | Decision |
| --- | --- | --- |
| Pixel typography and spacing | Conservative and compatible with the current templates | Use directly inline on mapped tags |
| `rem` | Caniemail estimates 69.05%; classic Outlook Windows is unsupported | Do not use for critical Markdown type/spacing |
| Positive pixel margins | Broad support, but classic Outlook has element/background quirks and no `auto` | Use explicit positive values; avoid negative/auto reliance |
| `list-style-type` | Broad; classic Outlook supports only type from the broader shorthand family | Use native lists and simple type; do not use `list-style-image` |
| `overflow-wrap` | 22.58% including partial; absent in classic Outlook Windows | Do not treat as the only long-token safeguard |
| `word-break` | 65.86% including partial with many buggy implementations; absent in classic Outlook Windows | Use only after fixture/client tests and accept degradation |
| `white-space` | 92.68% including partial for tested `nowrap`/`pre`; `pre` has mobile/webmail exceptions | Keep code simple and test it; do not depend on advanced values |
| `border-radius` | 82.92% including partial; classic Outlook requires VML for true rounded rendering | Decorative only; square fallback must remain acceptable |
| `flex` and `grid` | Both estimate 82.93% including partial but are absent in classic Outlook Windows and account-dependent in Gmail | Never use for critical Markdown layout |
| CSS variables | 45.24%; declarations are stripped/unsupported in Gmail and classic Outlook | Resolve to literal values before render |
| `!important` | 85.72% including partial with syntax/location-specific client bugs; classic Outlook does not support it inline | Avoid as a compatibility strategy |
| Media queries | Supported only in retained style blocks and vary by client | Progressive enhancement only; base Markdown must work without them |

## Exactly What Is Unsafe Or Unreliable

### Unsafe As A Required Styling Mechanism

- `.markdown p`, `.markdown h2`, `.markdown a`, and similar descendant rules in a head style block are not dependable enough for required typography, color, or spacing across the complete client matrix.
- `.markdown > p`, `h2 + p`, `p ~ ul`, and other child/sibling relationships are less robust and couple appearance to parser output details.
- `:first-child`, `:last-child`, `:nth-child`, `:not`, `:has`, pseudo-elements, and attribute-selector styling must not carry critical formatting.
- Tailwind `prose` and typography-plugin selectors are unsupported by React Email Tailwind.
- Tailwind arbitrary descendant/child variants such as `[&_p]:text-lg`, `[&>p]:mb-4`, or `[&_a]:underline` are unsupported for inlining and were observed to misapply in the installed version.
- Tailwind `space-y-*` and `space-x-*` rely on sibling selectors and are explicitly unsupported.
- Hover, focus, visited-link, and other pseudo-state styles are optional enhancements only.
- A class placed only on the built-in `Markdown` wrapper cannot cause Tailwind to discover elements inside `dangerouslySetInnerHTML`.
- Style blocks inserted in the body are specifically unsupported by Gmail and must not be used as a workaround.
- CSS inheritance from the wrapper is insufficient for headings, links, list markers/indentation, block spacing, quotes, rules, and code. Client defaults and more-specific rules may override inherited values.

### Unsafe Or Degraded Properties For Critical Output

- `rem` and critical `em`-relative dimensions where classic Outlook must be supported.
- CSS variables or `var(...)` dependencies.
- Flexbox or grid for any Markdown content structure.
- Negative margins, `margin:auto`, and margin-based tricks.
- `overflow-wrap` or `word-break` as the sole overflow control for long URLs/code.
- `white-space: pre-wrap` or advanced white-space behavior without direct client validation.
- `border-radius` where the rounded shape is semantically or functionally required.
- Background images, gradients, filters, transforms, positioning, floats, columns, and generated pseudo-element content for core prose rendering.
- `!important` as a way to defeat client styles.
- Media-query-only typography, visibility, or spacing.
- `list-style-image`, custom marker images, or generated marker content.
- Syntax-highlighting spans/classes that require a large selector sheet.

### Safe Baseline For Direct Inline Mapping

The conservative baseline is literal inline values on each generated element:

- `fontFamily` with system/web-safe fallbacks.
- `fontSize` in pixels.
- `lineHeight` in pixels.
- `fontWeight` and `fontStyle`.
- Literal `color` and `backgroundColor`.
- `textAlign` and simple `textDecoration`.
- Explicit positive pixel `marginTop`, `marginRight`, `marginBottom`, `marginLeft` or a simple pixel shorthand.
- Explicit pixel padding.
- Explicit border width, style, and color.
- Simple `listStyleType` plus tested list padding/indentation.
- Decorative `borderRadius` only when a square fallback is acceptable.

Inline placement improves delivery of these declarations; every property still needs email-client support. For inherited properties such as family and base color, putting them on the wrapper is a useful fallback, but critical child elements should still receive complete element styles.

## Viable Implementation Choices

### Choice A: Built-In React Email Markdown With Direct Style Mapping

**Fit:** Best minimal option for the current trusted-author requirement.

Use `markdownContainerStyles` for the wrapper and `markdownCustomStyles` for every supported element. The style object should be a versioned project constant owned by a trust-explicit wrapper such as the previously proposed `TrustedMarkdownContent`. It must use no descendant selectors.

The enabled style keys should initially be:

- `p`
- `h2`, `h3`, and `h4`
- `bold` and `italic`
- `link`
- `ul`, `ol`, and `li`
- `blockQuote`
- `hr`
- `codeInline` and `codeBlock`
- `br` only if a specific style is necessary

Reserve `h1` for the template heading. Do not enable images or tables merely because style keys exist.

Benefits:

- Already installed and smallest code/dependency change.
- Directly emits inline styles on generated Markdown tags.
- Composes inside the existing React Email shell and render path.
- Keeps trusted content authoring concise.

Constraints:

- Uses unsanitized Marked output and `dangerouslySetInnerHTML`; trust must remain real.
- Does not technically enforce the supported Markdown profile or URL policy.
- Raw HTML bypasses normal mapped-tag guarantees.
- Style mappings replace defaults and must be complete.
- Does not map to project React components.
- Installed table-header styling has a `th`/`td` mismatch.
- Long-token behavior and plain text still need tests.

Decision: **Recommended for version 1 only under the prior trusted-author/trusted-delivery conditions.**

### Choice B: Custom Markdown AST And Component Mapping

**Fit:** Best when enforcement, extensibility, or exact component behavior matters more than minimality.

Use `react-markdown` or a small mdast/hast pipeline, disable/skip raw HTML, allow only approved elements, apply a project-specific URL transform, and map every node to native email-safe tags or React Email/project components with direct `style` props. Tailwind may still style actual mapped React elements with simple classes, but direct inline styles remain preferred for the Markdown design tokens.

Benefits:

- Produces React elements that can be mapped to project components.
- Can technically disable raw HTML and unsupported elements.
- Can enforce URL schemes and node policy.
- Gives explicit control over nested code, links, headings, lists, and unsupported-node behavior.
- Avoids relying on generated string HTML for ordinary Markdown.

Constraints:

- Adds parser/runtime dependencies, mapping code, bundle size, CPU cost, and maintenance.
- Mapped React Email components can emit table-oriented markup that must be checked for valid nesting inside lists, paragraphs, and block quotes.
- `react-markdown` defaults are not the final policy: its default URL transform permits more schemes and relative URLs than the prior recommendation, so use a narrower transform.
- Plugins can broaden syntax and security surface; omit GFM/raw HTML initially.
- Requires Bun and Worker bundle/runtime validation.

Decision: **Required before public/CMS/third-party input, technical syntax enforcement, or project-component mapping becomes a requirement. Otherwise viable but not proportionate for the stated trusted-only version.**

### Choice C: No Markdown

**Fit:** Best for structured transactional content rather than long-form authored prose.

Continue constructing the body from typed React Email components and project parts such as `Text`, `Heading`, `Section`, `LinkButton`, `CodeBlock`, rows, and columns.

Benefits:

- Strongest typing, escaping, layout control, and direct element styling.
- No parser, HTML injection boundary, Markdown policy, or parser runtime cost.
- Best fit for personalized fields, buttons, cards, invoice rows, and conditional structures.
- Matches all existing templates.

Constraints:

- Long-form copy is more verbose to author and maintain.
- Non-developer content editing is less convenient.
- Repeated prose structures may require explicit components.

Decision: **Retain as the default for all existing transactional templates and use it instead of Markdown whenever the content is structured or heavily dynamic. Do not migrate existing templates to Markdown merely for consistency.**

## Decision Matrix

| Requirement | Built-in Markdown + direct map | Custom AST/component map | No Markdown |
| --- | --- | --- | --- |
| Sole trusted author | Best minimal fit | Valid but more machinery | Valid |
| Reliable element styles | Strong with complete inline map | Strongest control with inline mapped components | Strongest |
| Container descendant selectors | Not recommended | Unnecessary | Unnecessary |
| Technical raw HTML rejection | No | Yes | Yes by absence of parser |
| Technical element allowlist | No | Yes | Yes by component API |
| Project component reuse | Limited | Strong | Strongest |
| Long-form authoring | Strong | Strong | Weakest |
| Structured/dynamic transactional layout | Weak | Moderate | Strongest |
| Incremental bundle/runtime cost | Lowest | Highest of these choices | None |
| Current recommendation | Choose for trusted prose | Choose when guarantees broaden | Keep for existing structured templates |

## Future Style Contract

If Choice A is approved later, one shared style definition should own all Markdown appearance. It should not accept caller-provided styles or selectors.

The contract should define:

- Wrapper family, base color, base size/line height, and optional width-safe padding.
- Paragraph pixel size, line height, and positive margins.
- Complete `h2`-`h4` size, line height, weight, color, and margins.
- Link color, underline, and optional tested long-link behavior.
- List type, pixel indentation, outer margins, and item spacing.
- Block quote border, background color, and pixel margins/padding.
- Horizontal rule border and spacing.
- Inline-code family, size, background, color, and padding.
- Code-block family, size, line height, background, border, padding, and acceptable overflow degradation.
- Strong/emphasis styles.

The map should deliberately omit or neutralize styles for unsupported elements rather than relying on browser defaults. Content policy, not style-map omission alone, must keep unsupported syntax out when using the built-in parser.

## Constraints And Gotchas

- Trusted authorship is not enough if an unauthenticated caller can submit arbitrary Markdown. Preserve the delivery trust boundary from the prior plan.
- Styling does not sanitize Markdown or validate links.
- CORS is not authentication.
- Existing Valibot schemas are associated with routes for OpenAPI but are not currently enforced before rendering.
- Built-in Markdown custom entries replace defaults; partial overrides silently discard the rest of that element's defaults.
- Browser preview success does not prove inbox rendering, especially when appearance comes from inheritance.
- Direct inline CSS wins over many client style-removal problems but cannot add support for properties a renderer does not implement.
- Client names are not rendering engines. Gmail account type and Outlook variant must be recorded in test evidence.
- Markdown parser output can change with dependency upgrades. Lockfile upgrades require fixture review.
- Raw HTML can introduce elements that bypass the intended mapping and can alter nesting.
- Lists, quotes, and code blocks have native client defaults. Every enabled block element needs an explicit style and client fixture.
- Long URLs and code cannot be made universally safe through one CSS wrapping property. Bound content, preserve container width, prefer breakable authored text, and test real examples.
- Inline styles enlarge repeated Markdown output. Measure rendered HTML and Gmail clipping risk at the maximum source size.
- Plain-text output is unaffected by CSS but must preserve hierarchy, links, lists, and code readability.
- Dark mode may alter colors. Use acceptable contrast and test rather than depend on unsupported selectors.
- The existing templates' `Tailwind` usage can continue. The recommendation only forbids using its complex selectors to reach Markdown-generated string HTML.
- Do not combine the future shell extraction, trust/API changes, and Markdown style implementation into one review.

## Tests And Acceptance Criteria

No application tests are added by this research-only task. Future implementation should use the following gates.

### Rendered Markup Tests

- Render every supported Markdown node in one fixture.
- Assert each `p`, `h2`-`h4`, `a`, `ul`, `ol`, `li`, `blockquote`, `hr`, `pre`, `code`, `strong`, and `em` has the expected direct inline declaration where applicable.
- Assert output does not contain `prose`, arbitrary descendant variants, `space-y-*`, critical descendant rules, CSS variables, or critical `rem` values.
- Assert the base rendering remains legible after removing all `<style>` elements from the rendered HTML.
- Assert only one Markdown wrapper and one email document shell are emitted.
- Assert the generated style map contains complete values rather than accidental partial overrides.
- Assert raw HTML/images/tables/task controls are absent from approved fixtures.
- Record normalized HTML fixtures and review them on React Email dependency upgrades.

### Styling Regression Tests

- Paragraph and heading spacing does not depend on first/last-child or sibling selectors.
- Link color and underline are inline on each anchor.
- Lists retain markers and readable indentation without a head style block.
- Quotes retain a visible border/background fallback without rounded corners.
- Code remains readable if `overflow-wrap`, `word-break`, radius, or advanced white-space handling is ignored.
- The 600 px shell does not expand for representative long URLs, long unbroken strings, nested lists, or code.
- Existing `Footer`, `LinkButton`, and `CodeBlock` output remains unchanged unless separately migrated.

### Plain-Text Tests

- Heading and paragraph order is correct.
- Ordered and unordered list markers remain readable.
- Link destinations remain visible.
- Inline and block code remain distinguishable.
- Quote text is not lost.
- Unicode and line endings remain readable.

### Client Matrix

- Gmail desktop web with a Gmail account.
- Gmail iOS and Android with a Gmail account.
- Gmail iOS or Android with a non-Google account if that is a supported recipient path.
- Apple Mail on macOS and iOS.
- Outlook.com or new Outlook.
- Classic Outlook for Windows 2016/2019/2021 if it is a release target.
- Outlook iOS/Android if materially used.
- Yahoo desktop and Android if materially used.
- One additional mobile client from actual recipient analytics.

Each screenshot/test record must identify the exact client variant, account type where relevant, OS, normal/dark mode, and whether images/styles were blocked.

### Runtime And Contract Tests

- Runtime schema validation and source/body limits occur before Markdown parsing.
- The built-in trusted route is authenticated/private or selects bundled content by ID.
- Bun and workerd render representative and maximum-size Markdown within the approved CPU/memory budget.
- Worker compressed bundle size retains approved headroom.
- Rendered HTML stays under the agreed size threshold and representative messages avoid Gmail clipping.
- Existing API, OpenAPI, Worker, and client-import tests pass.

## Future Sequenced Plan

1. Approve the trusted-delivery contract and client matrix from the prior plan.
2. Decide whether policy enforcement is sufficient; if not, select custom AST mapping now.
3. Approve the element profile and direct inline style contract.
4. Restore a clean typecheck baseline and enforce runtime request validation in separate changes.
5. Extract the shared React Email shell with existing-template output regressions.
6. Add a trust-explicit Markdown wrapper using either the built-in style map or the approved AST map.
7. Add generated HTML/plain-text fixtures before exposing a route.
8. Verify Bun, Worker, output-size, and inbox-client behavior.
9. Register the additive Markdown API only after trust, styling, runtime, and client gates pass.
10. Revisit AST mapping whenever provenance, interpolation, syntax, component, or enforcement requirements change.

## Review Decisions

### Decisions Made By This Follow-Up

- Keep React Email.
- Do not implement application code in this task.
- Do not rely on container descendant selectors for critical Markdown styling.
- Do not use Tailwind `prose`, arbitrary descendant/child variants, or `space-*` for generated Markdown children.
- Prefer direct inline element styling.
- Retain built-in React Email Markdown as the minimal recommendation for the already-defined trusted-only boundary.
- Retain AST/component mapping as the required escalation for technical policy enforcement or broader trust.
- Retain no-Markdown React Email composition for existing and structured transactional templates.

### Decisions Required Before Implementation

1. **Rendering choice:** Approve built-in trusted Markdown with direct styles, or require AST/component mapping now.
2. **Trust guarantee:** Confirm trusted delivery/authentication or bundled `contentId`, not trusted authorship alone.
3. **Raw HTML guarantee:** Approve policy/review only, or require technical rejection and select AST mapping.
4. **Markdown profile:** Confirm paragraphs, `h2`-`h4`, emphasis, strong, links, lists, quotes, rules, breaks, and plain code only.
5. **Deferred content:** Confirm `h1`, images, tables, tasks, embeds, raw HTML, and highlighting are unavailable in version 1.
6. **Style contract:** Approve pixel-based literal styles and complete per-element entries.
7. **Client matrix:** Confirm whether non-Google Gmail accounts, classic Windows Outlook, and Yahoo Android are release blockers.
8. **Degradation:** Approve square corners, conservative code wrapping, and no complex responsive Markdown layout as acceptable fallbacks.
9. **Long content:** Approve source/output limits and authored breakability requirements for long URLs/code.
10. **Future trigger:** Confirm that public/CMS/third-party content, untrusted interpolation, or technical allowlisting requires AST mapping before release.

## Online Sources

Primary product documentation:

- React Email Markdown API and direct style maps: https://react.email/docs/components/markdown
- React Email Tailwind inlining, pixel preset, and complex-selector limitations: https://react.email/docs/components/tailwind
- React Email repository: https://github.com/resend/react-email
- Installed Markdown source: `node_modules/@react-email/markdown/dist/index.mjs`
- Installed Markdown types: `node_modules/@react-email/markdown/dist/index.d.mts`
- Installed Tailwind package guidance: `node_modules/@react-email/tailwind/readme.md`
- Gmail official CSS support: https://developers.google.com/gmail/design/css
- React Markdown AST, component maps, allowed elements, URL transform, raw HTML, and security: https://github.com/remarkjs/react-markdown

Email compatibility evidence:

- `<style>` element: https://www.caniemail.com/features/html-style/
- Descendant combinator: https://www.caniemail.com/features/css-selector-descendant/
- Child combinator: https://www.caniemail.com/features/css-selector-child/
- Adjacent sibling combinator: https://www.caniemail.com/features/css-selector-adjacent-sibling/
- Class selector: https://www.caniemail.com/features/css-selector-class/
- Type selector: https://www.caniemail.com/features/css-selector-type/
- `rem`: https://www.caniemail.com/features/css-unit-rem/
- Margin: https://www.caniemail.com/features/css-margin/
- List styles: https://www.caniemail.com/features/css-list-style/
- `overflow-wrap`: https://www.caniemail.com/features/css-overflow-wrap/
- `word-break`: https://www.caniemail.com/features/css-word-break/
- `white-space`: https://www.caniemail.com/features/css-white-space/
- Border radius: https://www.caniemail.com/features/css-border-radius/
- Flexbox: https://www.caniemail.com/features/css-display-flex/
- Grid: https://www.caniemail.com/features/css-display-grid/
- CSS variables: https://www.caniemail.com/features/css-variables/
- `!important`: https://www.caniemail.com/features/css-important/

## Review Outcome Template

```text
Rendering choice: built-in trusted Markdown / custom AST / no Markdown
Trusted delivery boundary: application auth / named upstream / bundled contentId
Raw HTML enforcement: policy and review / technically rejected by AST
Markdown profile approved: yes / changes: ...
Pixel-based direct style map approved: yes / changes: ...
Critical descendant selectors prohibited: yes / no
Tailwind prose/arbitrary descendants/space-* prohibited: yes / no
Classic Windows Outlook release blocker: yes / no
Gmail non-Google account path required: yes / no
Yahoo Android required: yes / no
Square-corner and conservative-code fallback approved: yes / no
Source/output limits approved: yes / changes: ...
Future AST migration trigger approved: yes / no
```
