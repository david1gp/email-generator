import { handleRequest } from "@/server/handleRequest"

export interface Env {
  VERSION: string
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    const version = env.VERSION
    return handleRequest(req, url, version)
  },
}
