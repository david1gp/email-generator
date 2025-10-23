import { apiRouteDef } from "@/api/apiRouteDef"
import { setHeaderVersion } from "@/server/headers/setHeaderVersion"
import { handleRenderRequest } from "./handleRenderRequest"

export interface Env {
  VERSION: string
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    const version = env.VERSION

    if (url.pathname === "/health") {
      const r = new Response("OK")
      return setHeaderVersion(r, version)
    }

    if (url.pathname === "/version") {
      const r = new Response(version)
      return setHeaderVersion(r, version)
    }

    if (req.method !== "POST") {
      const r = new Response("Method not allowed", { status: 405 })
      return setHeaderVersion(r, version)
    }

    for (const def of apiRouteDef) {
      const apiPath = "/renderEmailTemplate/" + def.name
      if (url.pathname === apiPath) {
        const r = await handleRenderRequest(req, def.schema, def.renderFn, def.name)
        return setHeaderVersion(r, version)
      }
    }

    const r = new Response("API route found", { status: 404 })
    return setHeaderVersion(r, version)
  },
}
