import type { Env } from "../../env/Env.js"

const documentationCachePaths = new Set(["/", "/openapi"])

export const documentationCacheControl = "public, max-age=300, s-maxage=86400"
export const workerCacheStatusHeader = "X-Worker-Cache"
export const workerCacheVersionHeader = "X-Worker-Cache-Version"

export type WorkerCacheStatus = "HIT" | "MISS" | "BYPASS"

type FetchFresh = () => Response | Promise<Response>

export function isWorkerCacheableRequest(request: Request): boolean {
  if (request.method !== "GET") {
    return false
  }

  if (request.headers.has("Authorization") || request.headers.has("Cookie")) {
    return false
  }

  const url = new URL(request.url)
  return documentationCachePaths.has(url.pathname)
}

export function getWorkerCacheVersion(env: Env): string {
  return env.CF_VERSION_METADATA?.id || env.VERSION || "local"
}

export function withDocumentationCacheHeaders(response: Response): Response {
  const nextResponse = cloneResponse(response)
  nextResponse.headers.set("Cache-Control", documentationCacheControl)
  appendVaryHeader(nextResponse.headers, "Accept-Encoding")
  appendVaryHeader(nextResponse.headers, "Origin")
  return nextResponse
}

export async function fetchWithWorkerCache(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  fetchFresh: FetchFresh,
): Promise<Response> {
  if (!isWorkerCacheableRequest(request) || typeof caches === "undefined") {
    return withWorkerCacheHeaders(await fetchFresh(), env, "BYPASS")
  }

  const cache = (caches as unknown as { default: Cache }).default
  const cacheKey = createWorkerCacheKey(request, env)
  const cachedResponse = await cache.match(cacheKey)

  if (cachedResponse) {
    return withWorkerCacheHeaders(cachedResponse, env, "HIT")
  }

  const freshResponse = await fetchFresh()

  if (!isStorableResponse(freshResponse)) {
    return withWorkerCacheHeaders(freshResponse, env, "BYPASS")
  }

  const cacheResponse = withDocumentationCacheHeaders(freshResponse)
  const cachePut = cache.put(cacheKey, cacheResponse.clone()).catch((error: unknown) => {
    console.error("Failed to write worker cache", error)
  })

  ctx.waitUntil(cachePut)

  return withWorkerCacheHeaders(cacheResponse, env, "MISS")
}

export function createWorkerCacheKey(request: Request, env: Env): Request {
  const url = new URL(request.url)
  url.searchParams.delete("__worker_cache_origin")
  url.searchParams.delete("__worker_cache_version")

  const origin = request.headers.get("Origin")
  if (origin) {
    url.searchParams.set("__worker_cache_origin", origin)
  }
  url.searchParams.set("__worker_cache_version", getWorkerCacheVersion(env))
  url.searchParams.sort()
  return new Request(url.toString(), { method: "GET" })
}

function isStorableResponse(response: Response): boolean {
  return response.status === 200
}

function withWorkerCacheHeaders(response: Response, env: Env, status: WorkerCacheStatus): Response {
  const nextResponse = cloneResponse(response)
  nextResponse.headers.set(workerCacheStatusHeader, status)
  nextResponse.headers.set(workerCacheVersionHeader, getWorkerCacheVersion(env))

  if (status !== "BYPASS" && isWorkerCacheableResponse(nextResponse)) {
    nextResponse.headers.set("Cache-Control", documentationCacheControl)
  }

  return nextResponse
}

function isWorkerCacheableResponse(response: Response): boolean {
  return response.status === 200
}

function cloneResponse(response: Response): Response {
  return new Response(response.body, response)
}

function appendVaryHeader(headers: Headers, value: string): void {
  const existingVary = headers.get("Vary")
  if (!existingVary) {
    headers.set("Vary", value)
    return
  }

  const existingValues = existingVary.split(",").map((item) => item.trim().toLowerCase())
  if (!existingValues.includes(value.toLowerCase())) {
    headers.set("Vary", `${existingVary}, ${value}`)
  }
}
