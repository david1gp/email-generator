import type { HonoApp } from "@/utils/HonoApp"
import { toJsonSchema } from "@valibot/to-json-schema"
import { describeRoute, resolver } from "hono-openapi"
import type { BaseIssue, BaseSchema } from "valibot"
import * as a from "valibot"
import { apiPathRenderEmailTemplate } from "~/apiPathRenderEmailTemplate"
import { resultErrSchema } from "~utils/result/resultErrSchema"
import type { ApiRouteDefType } from "../api/ApiRouteDefType"

export function addRoutesTemplates(app: HonoApp, apiRouteDef: readonly ApiRouteDefType<any>[]) {
  for (const def of apiRouteDef) {
    const apiPath = "/" + apiPathRenderEmailTemplate + "/" + def.name
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
          500: {
            description: "Internal server error",
            content: {
              "application/json": { schema: resolver(resultErrSchema) },
            },
          },
        },
      }),
      async (c) => {
        const body = await c.req.json()
        const result = await def.renderFn(body)
        return c.json(result)
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
