import type { Env } from "../env/Env"
import { setHeaderTimingSingleValue } from "./headers/setHeaderTimingSingleValue"
import { createApp } from "./hono"

const app = createApp()

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startedAt = Date.now()
    const response = await app.fetch(request, env, ctx)
    return setHeaderTimingSingleValue(response, "total", startedAt)
  },
}
