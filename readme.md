# 📧 Email Generator Microservice

A lightweight, self-hostable service for rendering HTML emails with React Email.

- **Hassle-free & maintenance-free** – runs entirely on the free tier of Cloudflare Workers.
- **Simple to use** – perfect for login codes, registration flows, and other transactional emails.
- **Flexible** – develop locally with a Bun server, then deploy serverlessly with zero configuration.
- **Clean separation** – does not pollute your project with `react` or `react-email` imports or dependencies.

Whether you need a quick drop-in solution or a fully open-source foundation for your project, this microservice makes email generation easy and reliable.

Quick Links

- code - https://github.com/adaptive-shield-matrix/email-generator
- npm - https://www.npmjs.com/package/@adaptive-sm/email-generator
- react email docs - https://react.email/docs/getting-started/manual-setup

## Features

- Renders HTML and plain text email templates.
- Supports internationalization (English and German).
- Validates input using Valibot schemas.
- Includes server timing headers for performance monitoring.
- Endpoints: `/renderEmailTemplate/signUpV1`, `/renderEmailTemplate/signInV1`, and `/renderEmailTemplate/orgInvitationV1`.

## Templates

|                                                                                                        |                                                                                                        |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **signUpV1** - Sign-up / Registration<br>![signUpV1](https://f003.backblazeb2.com/file/email-generator-images/signUpV1.jpg) | **signInV1** - Sign-in / Login / Forgot password<br>![signInV1](https://f003.backblazeb2.com/file/email-generator-images/signInV1.jpg) |
| **passwordChangeV1** - Change/Reset Password<br>![passwordChangeV1](https://f003.backblazeb2.com/file/email-generator-images/PasswordChangeV1.jpg) | **emailChangeV1** - Change Email<br>![EmailChangeV1](https://f003.backblazeb2.com/file/email-generator-images/EmailChangeV1.jpg) |
| **orgInvitationV1** - Organization invitation<br>![orgInvitationV1](https://f003.backblazeb2.com/file/email-generator-images/orgInvitationV1.jpg) | |

## Prerequisites

- Node.js (for package management) or Bun.
- Cloudflare account (for Workers deployment).

## Local Development

1. Clone the repository.
2. Install dependencies:
   ```
   bun install
   ```

### With Bun Server

- Start the development server:

  ```
  bun run start
  ```

  The server runs on `http://localhost:3055` (port configurable via `src/server/serverPortBun.ts`).

- For React Email preview (optional):
  ```
  bun run dev
  ```
  This starts the preview server at `http://localhost:3055` for template development.

### With Cloudflare Workers

- Start the local Worker development server:

  ```
  bun run dev:worker
  ```

  The Worker runs on `http://localhost:8787` (default Wrangler port).

- To test endpoints, send POST requests to:
  - `http://localhost:8787/renderEmailTemplate/signUpV1`
  - `http://localhost:8787/renderEmailTemplate/signInV1`
  - `http://localhost:8787/renderEmailTemplate/orgInvitationV1`

## Testing

Run tests with Bun:

```
bun run test
```

Or in watch mode:

```
bun run test:w
```

Tests cover API rendering for login codes (extend for registration as needed).

## Deployment to Cloudflare Workers

1. **Login to Cloudflare**:

   ```
   wrangler login
   ```

2. **Configure Account ID** (if needed, add to `wrangler.toml`):

   ```
   wrangler whoami
   ```

   Then update `wrangler.toml` with `account_id = "your-account-id"`.

3. **Deploy**:

   ```
   bun run deploy
   ```

   (Or `npx wrangler deploy`.)

4. **Monitor**:

   `wrangler tail email-generator-worker`
