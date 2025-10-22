import { apiRouteDef } from "@/api/apiRouteDef"
import { handleRenderRequest } from "@/server/handleRenderRequest"
import { serverPortBun } from "@/server/serverPortBun"
import { apiPathGenerateEmail } from "~/apiPathGenerateEmail"

Bun.serve({
  port: serverPortBun,
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === "/health") {
      return new Response("OK")
    }

    if (url.pathname === "/memoryUsage") {
      const memoryUsageMB = Math.trunc(process.memoryUsage().rss / 1024 / 1024)
      return new Response(JSON.stringify({ memoryUsageMB }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    for (const def of apiRouteDef) {
      const apiPath = "/" + apiPathGenerateEmail + "/" + def.name
      if (url.pathname === apiPath) {
        return await handleRenderRequest(req, def.schema, def.renderFn, def.name)
      }
    }

    return new Response("API route found", { status: 404 })
  },
})

console.log("Server running on http://localhost:" + serverPortBun)
