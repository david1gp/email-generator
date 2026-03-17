import type { Env } from "../env/Env"
import { apiRouteDef } from "./api/apiRouteDef"
import { notAllowedHandler } from "./handlers/technical/notAllowedHandler"
import { getCorsHeaders } from "./headers/getCorsHeaders"
import { addRoutesOpenapi } from "./routes/addRoutesOpenapi"
import { addRoutesServer } from "./routes/addRoutesServer"
import { addRoutesTemplates } from "./routes/addRoutesTemplates"
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

  addRoutesTemplates(app, apiRouteDef)
  addRoutesOpenapi(app)
  addRoutesServer(app)

  app.notFound(notAllowedHandler)

  const notAllowedMethods = ["PUT", "PATCH", "DELETE"]
  for (const method of notAllowedMethods) {
    app.on(method, "/*", notAllowedHandler)
  }

  return app
}
