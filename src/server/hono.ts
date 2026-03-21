import type { Env } from "../env/Env.js"
import { apiRouteDef } from "./api/apiRouteDef.js"
import { notAllowedHandler } from "./handlers/technical/notAllowedHandler.js"
import { getCorsHeaders } from "./headers/getCorsHeaders.js"
import { addRoutesOpenapi } from "./routes/addRoutesOpenapi.js"
import { addRoutesServer } from "./routes/addRoutesServer.js"
import { addRoutesTemplates } from "./routes/addRoutesTemplates.js"
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
