import { apiRouteDef } from "@/server/apiRouteDef"
import { handleRenderRequest } from "@/server/handleRenderRequest"
import { serverPort } from "@/server/serverPort"

Bun.serve({
  port: serverPort,
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === "/health") {
      return new Response("OK")
    }

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    for (const def of apiRouteDef) {
      const apiPath = "/renderEmailTemplate/" + def.name
      if (url.pathname === apiPath) {
        return await handleRenderRequest(req, def.schema, def.renderFn, def.name)
      }
    }

    return new Response("Api route found", { status: 404 })
  },
})

console.log("Server running on http://localhost:" + serverPort)
