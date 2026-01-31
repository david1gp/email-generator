import { isOnlineHandler } from "@/server/handlers/technical/isOnlineHandler"
import { rootHandler } from "@/server/handlers/technical/rootHandler"
import { versionHandler } from "@/server/handlers/technical/versionHandler"
import type { HonoApp } from "@/utils/HonoApp"
import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"

export function addRoutesServer(app: HonoApp) {
  app.get(
    "/",
    describeRoute({
      description: "Access denied for root path",
      tags: ["server"],
      responses: {
        403: {
          description: "Forbidden",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    rootHandler,
  )
  app.get(
    "/version",
    describeRoute({
      description: "Get the current API version",
      tags: ["server"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    versionHandler,
  )

  app.get(
    "/health",
    describeRoute({
      description: "Health check endpoint",
      tags: ["server"],
      responses: {
        200: {
          description: "Service is healthy",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    isOnlineHandler,
  )
}
