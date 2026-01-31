import { packageVersion } from "@/env/packageVersion"
import type { HonoApp } from "@/utils/HonoApp"
import { describeRoute, openAPIRouteHandler, resolver } from "hono-openapi"
import * as a from "valibot"

export function addRoutesOpenapi(app: HonoApp) {
  const openApiOptions = {
    documentation: {
      info: {
        title: "📧 Email Generator Microservice API",
        version: packageVersion,
        description: `A lightweight, self-hostable service for rendering HTML emails with React Email.

- **Hassle-free & maintenance-free** – runs entirely on the free tier of Cloudflare Workers.
- **Simple to use** – perfect for login codes, registration flows, and other transactional emails.
- **Flexible** – develop locally with a Bun server, then deploy serverlessly with zero configuration.
- **Clean separation** – does not pollute your project with "react" or "react-email" imports or dependencies.

Whether you need a quick drop-in solution or a fully open-source foundation for your project, this microservice makes email generation easy and reliable.

**Quick Links**

- code - [https://github.com/adaptive-shield-matrix/email-generator](https://github.com/adaptive-shield-matrix/email-generator)
- npm - [https://www.npmjs.com/package/@adaptive-sm/email-generator](https://www.npmjs.com/package/@adaptive-sm/email-generator)
- react email docs - [https://react.email/docs/getting-started/manual-setup](https://react.email/docs/getting-started/manual-setup)
`,
        components: {
          securitySchemes: {},
        },
      },
    },
  }

  app.get(
    "/openapi",
    describeRoute({
      description: "Get OpenAPI specification",
      tags: ["openapi"],
      security: [],
      responses: {
        200: {
          description: "OpenAPI JSON specification",
          content: {
            "application/json": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    openAPIRouteHandler(app, openApiOptions),
  )

  app.get(
    "/doc",
    describeRoute({
      description: "Get OpenAPI specification (redirect)",
      tags: ["openapi"],
      security: [],
      responses: {
        200: {
          description: "OpenAPI JSON specification",
          content: {
            "application/json": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    openAPIRouteHandler(app, openApiOptions),
  )

  addRoutesOpenapiSwagger(app)
}

export function addRoutesOpenapiSwagger(app: HonoApp) {
  app.get(
    "/ui",
    describeRoute({
      description: "Swagger UI documentation interface",
      tags: ["openapi"],
      security: [],
      responses: {
        200: {
          description: "Swagger UI HTML page",
          content: {
            "text/html": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    async (c) => {
      const uiHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Adaptive Email Generator API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/doc",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ]
    });
  </script>
</body>
</html>`
      return c.html(uiHtml)
    },
  )
}
