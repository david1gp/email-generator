import { apiRouteDef } from "@/server/api/apiRouteDef"
import { setHeaderVersion } from "@/server/headers/setHeaderVersion"
import { apiPathRenderEmailTemplate } from "~/apiPathRenderEmailTemplate"
import { handleRenderRequest } from "./handleRenderRequest"

export async function handleRequest(req: Request, url: URL, version: string): Promise<Response> {
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
    const apiPath = "/" + apiPathRenderEmailTemplate + "/" + def.name
    if (url.pathname === apiPath) {
      const r = await handleRenderRequest(req, def.schema, def.renderFn, def.name)
      return setHeaderVersion(r, version)
    }
  }

  const r = new Response("API route not found", { status: 404 })
  return setHeaderVersion(r, version)
}
