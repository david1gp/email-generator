# Shared multiline email signature

## Goal

Add one multiline legal-company signature field to the shared email layout so every template can render German-law company/address details, provide example signature data on selected templates, and expose the local preview through a managed systemd user service registered with caddy-projects.

## Decisions

- Model the signature as one optional multiline string in the shared footer contract to preserve existing API compatibility.
- Render line breaks safely in the shared footer/layout rather than in individual templates.
- Use the existing Bun React Email preview server and the repository's existing preview port/domain conventions.
- Keep the user-service definition and installer under `ops/systemd`, following allgroups-chat conventions while using this repository's actual checkout path.

## Approach

- Extend shared client/server footer types and schema, then render the legal signature in the common email chrome.
- Update representative template preview/example props and tests, including multiline rendering and all-template coverage.
- Add an installable systemd user unit for the preview server.
- Register the preview proxy with caddy-projects, install/enable/start the service, and verify both service and preview endpoint.

## Tasks

- [x] 1. Implement the shared multiline signature contract and rendering.
- [x] 2. Add representative example-company signature fixtures and automated coverage.
- [x] 3. Add the systemd user service and installer under `ops/systemd`.
- [x] 4. Register the project and plan docs with caddy-projects, enable/start the service, and verify the preview.

## Paths

- `client/types/FooterV1Type.ts`
- `src/server/schemas/parts/footerV1SchemaFields.ts`
- `src/template_parts/EmailLayout.tsx`
- `src/template_parts/Footer.tsx`
- `src/template_parts/footerV1ExampleData.ts`
- `src/templates/`
- `test/`
- `ops/systemd/`
