import { apiRouteDef } from "@/api/apiRouteDef"
import { getPackageVersion } from "@/ops/getPackageVersion"
import { handleRenderRequest } from "@/server/handleRenderRequest"
import { setHeaderVersion } from "@/server/headers/setHeaderVersion"
import { serverPortBun } from "@/server/serverPortBun"
import { apiPathGenerateEmail } from "~/apiPathGenerateEmail"

Bun.serve({
  port: serverPortBun,
  async fetch(req) {
    const version = getPackageVersion()
    const url = new URL(req.url)

    if (url.pathname === "/health") {
      const r = new Response("OK")
      return setHeaderVersion(r, version)
    }

    if (url.pathname === "/version") {
      const version = getPackageVersion()
      const r = new Response(version)
      return setHeaderVersion(r, version)
    }

    if (url.pathname === "/memoryUsage") {
      const memoryUsageMB = Math.trunc(process.memoryUsage().rss / 1024 / 1024)
      const r = new Response(JSON.stringify({ memoryUsageMB }), {
        headers: { "Content-Type": "application/json" },
      })
      return setHeaderVersion(r, version)
    }

    if (req.method !== "POST") {
      const r = new Response("Method not allowed", { status: 405 })
      return setHeaderVersion(r, version)
    }

    for (const def of apiRouteDef) {
      const apiPath = "/" + apiPathGenerateEmail + "/" + def.name
      if (url.pathname === apiPath) {
        const r = await handleRenderRequest(req, def.schema, def.renderFn, def.name)
        return setHeaderVersion(r, version)
      }
    }

    const r = new Response("API route found", { status: 404 })
    return setHeaderVersion(r, version)
  },
})

console.log("Server running on http://localhost:" + serverPortBun)
