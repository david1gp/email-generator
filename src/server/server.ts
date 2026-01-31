import { getPackageVersion } from "@/ops/getPackageVersion"
import { setHeaderVersion } from "@/server/headers/setHeaderVersion"
import { setHeaderTimingSingleValue } from "@/server/headers/setHeaderTimingSingleValue"
import { createApp } from "@/server/hono"
import { serverPortBun } from "@/server/ports/serverPortBun"

const app = createApp()

app.get("/memoryUsage", async (c) => {
  const memoryUsageMB = Math.trunc(process.memoryUsage().rss / 1024 / 1024)
  const r = new Response(JSON.stringify({ memoryUsageMB }), {
    headers: { "Content-Type": "application/json" },
  })
  return setHeaderVersion(r, c.env?.VERSION ?? getPackageVersion())
})

Bun.serve({
  port: serverPortBun,
  async fetch(req) {
    const startedAt = Date.now()
    const response = await app.fetch(req)
    return setHeaderTimingSingleValue(response, "total", startedAt)
  },
})

console.log("Server running on http://localhost:" + serverPortBun)
