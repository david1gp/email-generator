import { createResultError } from "@adaptive-ds/result"
import { resultErrSchema } from "@adaptive-ds/result/resultErrSchema.js"
import { toJsonSchema } from "@valibot/to-json-schema"
import { describeRoute, resolver } from "hono-openapi"
import type { BaseIssue, BaseSchema } from "valibot"
import * as a from "valibot"
import { apiPathRenderEmailTemplate } from "../../../client/apiPathRenderEmailTemplate.js"
import type { HonoApp } from "../../utils/HonoApp.js"
import type { ApiRouteDefType } from "../api/ApiRouteDefType.js"

export function addRoutesTemplates(app: HonoApp, apiRouteDef: readonly ApiRouteDefType<any>[]) {
  for (const def of apiRouteDef) {
    const apiPath = `/${apiPathRenderEmailTemplate}/${def.name}`
    app.post(
      apiPath,
      describeRoute({
        description: `Render ${def.name} email template`,
        tags: ["templates"],
        requestBody: {
          description: getDescriptionFromSchema(def.schema),
          required: true,
          content: {
            "application/json": {
              schema: getSchemaForRequestBody(def.schema),
            },
          },
        },
        responses: {
          200: {
            description: "Email rendered successfully",
            content: {
              "application/json": {
                schema: resolver(
                  a.object({
                    html: a.string(),
                    text: a.string(),
                    subject: a.string(),
                  }),
                ),
              },
            },
          },
          400: {
            description: "Bad request - invalid input",
            content: {
              "application/json": { schema: resolver(resultErrSchema) },
            },
          },
          ...(def.maxBodyBytes
            ? {
                413: {
                  description: "Payload too large - request body exceeds size limit",
                  content: {
                    "application/json": { schema: resolver(resultErrSchema) },
                  },
                },
              }
            : {}),
          500: {
            description: "Internal server error",
            content: {
              "application/json": { schema: resolver(resultErrSchema) },
            },
          },
        },
      }),
      async (c) => {
        if (def.maxBodyBytes) {
          const contentLengthStr = c.req.header("Content-Length") || c.req.header("content-length")
          if (contentLengthStr) {
            const contentLength = Number.parseInt(contentLengthStr, 10)
            if (!Number.isNaN(contentLength) && contentLength > def.maxBodyBytes) {
              const response = c.json(createResultError(def.name, "Payload Too Large"), 413)
              response.headers.set("Cache-Control", "no-store")
              return response
            }
          }
        }

        let jsonText: string
        try {
          jsonText = await c.req.text()
        } catch {
          const response = c.json(createResultError(def.name, "Invalid request body"), 400)
          response.headers.set("Cache-Control", "no-store")
          return response
        }

        if (!jsonText) {
          const response = c.json(createResultError(def.name, "Missing JSON body"), 400)
          response.headers.set("Cache-Control", "no-store")
          return response
        }

        if (def.maxBodyBytes && new TextEncoder().encode(jsonText).byteLength > def.maxBodyBytes) {
          const response = c.json(createResultError(def.name, "Payload Too Large"), 413)
          response.headers.set("Cache-Control", "no-store")
          return response
        }

        let body: unknown
        try {
          body = JSON.parse(jsonText)
        } catch {
          const response = c.json(createResultError(def.name, "Invalid JSON body"), 400)
          response.headers.set("Cache-Control", "no-store")
          return response
        }

        const parsing = a.safeParse(def.schema, body)
        if (!parsing.success) {
          const errorMessage = a.summarize(parsing.issues)
          const response = c.json(createResultError(def.name, errorMessage), 400)
          response.headers.set("Cache-Control", "no-store")
          return response
        }

        try {
          const result = await def.renderFn(parsing.output)
          const response = c.json(result)
          response.headers.set("Cache-Control", "no-store")
          return response
        } catch {
          const response = c.json(createResultError(def.name, "Internal server error"), 500)
          response.headers.set("Cache-Control", "no-store")
          return response
        }
      },
    )
  }
}

function getSchemaForRequestBody(schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>): object {
  try {
    const jsonSchema = toJsonSchema(schema, { errorMode: "ignore" })
    if (jsonSchema && typeof jsonSchema === "object" && "type" in jsonSchema) {
      return jsonSchema
    }
    return { type: "object", properties: {}, required: [] }
  } catch {
    return { type: "object", properties: {}, required: [] }
  }
}

function getDescriptionFromSchema(schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>): string {
  const metadata = (schema as any)["~metadata"]
  if (metadata && typeof metadata === "object") {
    if (metadata.title && metadata.description) {
      return `${metadata.title}: ${metadata.description}`
    }
    if (metadata.title) {
      return metadata.title
    }
    if (metadata.description) {
      return metadata.description
    }
  }
  return "Email template parameters"
}
