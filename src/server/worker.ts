import { apiRouteDef } from "@/api/apiRouteDef"
import { handleRenderRequest } from "./handleRenderRequest"

export default {
  async fetch(req: Request): Promise<Response> {
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

    return new Response("API route not found", { status: 404 })
  },
}
