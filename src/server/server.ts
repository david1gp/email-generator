import { getPackageVersion } from "@/ops/getPackageVersion"
import { handleRequest } from "@/server/handleRequest"
import { setHeaderVersion } from "@/server/headers/setHeaderVersion"
import { serverPortBun } from "@/server/ports/serverPortBun"

Bun.serve({
  port: serverPortBun,
  async fetch(req) {
    const version = getPackageVersion()
    const url = new URL(req.url)

    if (url.pathname === "/memoryUsage") {
      const memoryUsageMB = Math.trunc(process.memoryUsage().rss / 1024 / 1024)
      const r = new Response(JSON.stringify({ memoryUsageMB }), {
        headers: { "Content-Type": "application/json" },
      })
      return setHeaderVersion(r, version)
    }

    return handleRequest(req, url, version)
  },
})

console.log("Server running on http://localhost:" + serverPortBun)
