import type { Env } from "@/env/Env"

export function getCorsHeaders(env: Env | undefined, request: Request): Headers {
  const headers = new Headers()

  const allowOrigin = env?.HEADER_CORS_ALLOW_ORIGIN || "*"
  if (allowOrigin === "*") {
    headers.set("Access-Control-Allow-Origin", "*")
  } else {
    const requestOrigin = request.headers.get("Origin")
    if (requestOrigin && allowOrigin.split(",").some(o => o.trim() === requestOrigin)) {
      headers.set("Access-Control-Allow-Origin", requestOrigin)
    }
  }

  const maxAge = env?.HEADER_CORS_MAX_AGE || "300"
  headers.set("Access-Control-Max-Age", maxAge)

  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST")
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, If-Modified-Since")

  return headers
}
