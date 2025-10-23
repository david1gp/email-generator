import { apiRouteDef } from "@/api/apiRouteDef"
import { handleRenderRequest } from "@/server/handleRenderRequest"
import { setHeaderVersion } from "@/server/headers/setHeaderVersion"
import { serverPortBun } from "@/server/serverPortBun"
import { apiPathGenerateEmail } from "~/apiPathGenerateEmail"

Bun.serve({
  port: serverPortBun,
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === "/health") {
      const r = new Response("OK")
      return setHeaderVersion(r)
    }

    if (url.pathname === "/memoryUsage") {
      const memoryUsageMB = Math.trunc(process.memoryUsage().rss / 1024 / 1024)
      const r = new Response(JSON.stringify({ memoryUsageMB }), {
        headers: { "Content-Type": "application/json" },
      })
      return setHeaderVersion(r)
    }

    if (req.method !== "POST") {
      const r = new Response("Method not allowed", { status: 405 })
      return setHeaderVersion(r)
    }

    for (const def of apiRouteDef) {
      const apiPath = "/" + apiPathGenerateEmail + "/" + def.name
      if (url.pathname === apiPath) {
        const r = await handleRenderRequest(req, def.schema, def.renderFn, def.name)
        return setHeaderVersion(r)
      }
    }

    const r = new Response("API route found", { status: 404 })
    return setHeaderVersion(r)
  },
})

console.log("Server running on http://localhost:" + serverPortBun)
