import type { Env } from "@/env/Env"
import { notAllowedHandler } from "@/server/handlers/technical/notAllowedHandler"
import { getCorsHeaders } from "@/server/headers/getCorsHeaders"
import { addRoutesOpenapi } from "@/server/routes/addRoutesOpenapi"
import { addRoutesServer } from "@/server/routes/addRoutesServer"
import { addRoutesTemplates } from "@/server/routes/addRoutesTemplates"
import { apiRouteDef } from "@/server/api/apiRouteDef"
import { Hono } from "hono"

export function createApp(): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>()

  app.use("/*", async (c, next) => {
    const corsHeaders = getCorsHeaders(c.env, c.req.raw)
    if (c.req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }
    await next()
    corsHeaders.forEach((value, key) => {
      c.header(key, value)
    })
    return
  })

  addRoutesServer(app)
  addRoutesTemplates(app, apiRouteDef)
  addRoutesOpenapi(app)

  app.notFound(notAllowedHandler)

  const notAllowedMethods = ["PUT", "PATCH", "DELETE"]
  for (const method of notAllowedMethods) {
    app.on(method, "/*", notAllowedHandler)
  }

  return app
}
