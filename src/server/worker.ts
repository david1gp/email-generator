import type { Env } from "../env/Env.js"
import { setHeaderTimingSingleValue } from "./headers/setHeaderTimingSingleValue.js"
import { createApp } from "./hono.js"

const app = createApp()

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startedAt = Date.now()
    const response = await app.fetch(request, env, ctx)
    return setHeaderTimingSingleValue(response, "total", startedAt)
  },
}
