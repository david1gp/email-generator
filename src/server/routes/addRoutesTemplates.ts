import type { HonoApp } from "@/utils/HonoApp"
import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"
import { apiPathRenderEmailTemplate } from "~/apiPathRenderEmailTemplate"
import type { ApiRouteDefType } from "../api/ApiRouteDefType"
import { resultErrSchema } from "~utils/result/resultErrSchema"

export function addRoutesTemplates(app: HonoApp, apiRouteDef: readonly ApiRouteDefType[]) {
  for (const def of apiRouteDef) {
    const apiPath = "/" + apiPathRenderEmailTemplate + "/" + def.name
    app.post(
      apiPath,
      describeRoute({
        description: `Render ${def.name} email template`,
        tags: ["templates"],
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
