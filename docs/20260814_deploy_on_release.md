# Deploy on release

## Goal

Deploy all configured email-generator workers after a successful release, and deploy the current release now.

## Decisions

- Run `bun run deploy` locally after GitHub release creation; do not add deployment to the npm publish workflow.
- Let deployment failure fail the release command visibly; deployment remains non-transactional across targets.
- Verify the deployed version through existing deployment output and version endpoints where available.

## Approach

Add the existing deployment command to the end of the local release workflow, verify the script change, then run the existing deployment command for the current version and confirm the workers report it.

## Tasks

1. **Done** — Add `bun run deploy` to the local release workflow after GitHub release creation.
2. **Done** — Verify the release workflow change.
3. **In progress** — Deploy the current release and verify target versions.

## Paths

- `ops/release.sh`
- `ops/deploy.ts`
- `docs/20260814_deploy_on_release.md`
