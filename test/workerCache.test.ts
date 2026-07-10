import { afterEach, describe, expect, test } from "bun:test"
import type { Env } from "../src/env/Env.js"
import {
  documentationCacheControl,
  fetchWithWorkerCache,
  workerCacheStatusHeader,
  workerCacheVersionHeader,
} from "../src/server/cache/workerCache.js"

class InMemoryCache {
  readonly store = new Map<string, Response>()

  async match(request: Request): Promise<Response | undefined> {
    return this.store.get(request.url)?.clone()
  }

  async put(request: Request, response: Response): Promise<void> {
    this.store.set(request.url, response.clone())
  }

  async delete(request: Request): Promise<boolean> {
    return this.store.delete(request.url)
  }
}

function createExecutionContext() {
  const waitUntilPromises: Promise<unknown>[] = []
  const ctx = {
    waitUntil: (promise: Promise<unknown>) => {
      waitUntilPromises.push(promise)
    },
    passThroughOnException: () => {},
  } as ExecutionContext

  return {
    ctx,
    async flushWaitUntil() {
      await Promise.all(waitUntilPromises)
    },
  }
}

function createEnv(workerVersionId: string): Env {
  return {
    VERSION: "0.14.0",
    ENV_NAME: "test",
    CF_VERSION_METADATA: {
      id: workerVersionId,
      tag: "test",
      timestamp: "2026-07-09T00:00:00.000Z",
    },
  }
}

const globalWithCaches = globalThis as typeof globalThis & { caches?: CacheStorage }
const originalCaches = globalWithCaches.caches

afterEach(() => {
  globalWithCaches.caches = originalCaches
})

describe("worker cache", () => {
  test("caches documentation GETs and cache-busts when Worker version metadata changes", async () => {
    const cache = new InMemoryCache()
    globalWithCaches.caches = { default: cache } as unknown as CacheStorage

    let renderCount = 0
    const request = new Request("https://email-generator.test/openapi?b=2&a=1")

    const firstExecutionContext = createExecutionContext()
    const firstResponse = await fetchWithWorkerCache(
      request,
      createEnv("deploy-a"),
      firstExecutionContext.ctx,
      async () => {
        renderCount += 1
        return Response.json({ renderCount })
      },
    )
    await firstExecutionContext.flushWaitUntil()

    const firstJson = (await firstResponse.json()) as { renderCount: number }
    expect(firstResponse.headers.get(workerCacheStatusHeader)).toBe("MISS")
    expect(firstResponse.headers.get(workerCacheVersionHeader)).toBe("deploy-a")
    expect(firstResponse.headers.get("Cache-Control")).toBe(documentationCacheControl)
    expect(firstJson.renderCount).toBe(1)

    const secondExecutionContext = createExecutionContext()
    const secondResponse = await fetchWithWorkerCache(
      request,
      createEnv("deploy-a"),
      secondExecutionContext.ctx,
      async () => {
        renderCount += 1
        return Response.json({ renderCount })
      },
    )
    await secondExecutionContext.flushWaitUntil()

    const secondJson = (await secondResponse.json()) as { renderCount: number }
    expect(secondResponse.headers.get(workerCacheStatusHeader)).toBe("HIT")
    expect(secondResponse.headers.get(workerCacheVersionHeader)).toBe("deploy-a")
    expect(secondJson.renderCount).toBe(1)
    expect(renderCount).toBe(1)

    const newDeploymentExecutionContext = createExecutionContext()
    const newDeploymentResponse = await fetchWithWorkerCache(
      request,
      createEnv("deploy-b"),
      newDeploymentExecutionContext.ctx,
      async () => {
        renderCount += 1
        return Response.json({ renderCount })
      },
    )
    await newDeploymentExecutionContext.flushWaitUntil()

    const newDeploymentJson = (await newDeploymentResponse.json()) as { renderCount: number }
    expect(newDeploymentResponse.headers.get(workerCacheStatusHeader)).toBe("MISS")
    expect(newDeploymentResponse.headers.get(workerCacheVersionHeader)).toBe("deploy-b")
    expect(newDeploymentJson.renderCount).toBe(2)
    expect(renderCount).toBe(2)
  })

  test("ignores client-supplied worker cache metadata query params", async () => {
    const cache = new InMemoryCache()
    globalWithCaches.caches = { default: cache } as unknown as CacheStorage

    let renderCount = 0
    const firstRequest = new Request(
      "https://email-generator.test/openapi?b=2&__worker_cache_origin=https%3A%2F%2Fevil.example&a=1&__worker_cache_version=old",
    )
    const secondRequest = new Request(
      "https://email-generator.test/openapi?__worker_cache_version=other&a=1&b=2&__worker_cache_origin=https%3A%2F%2Fother.example",
    )

    const firstExecutionContext = createExecutionContext()
    const firstResponse = await fetchWithWorkerCache(
      firstRequest,
      createEnv("deploy-a"),
      firstExecutionContext.ctx,
      async () => {
        renderCount += 1
        return Response.json({ renderCount })
      },
    )
    await firstExecutionContext.flushWaitUntil()

    const secondExecutionContext = createExecutionContext()
    const secondResponse = await fetchWithWorkerCache(
      secondRequest,
      createEnv("deploy-a"),
      secondExecutionContext.ctx,
      async () => {
        renderCount += 1
        return Response.json({ renderCount })
      },
    )
    await secondExecutionContext.flushWaitUntil()

    const secondJson = (await secondResponse.json()) as { renderCount: number }
    expect(firstResponse.headers.get(workerCacheStatusHeader)).toBe("MISS")
    expect(secondResponse.headers.get(workerCacheStatusHeader)).toBe("HIT")
    expect(secondJson.renderCount).toBe(1)
    expect(renderCount).toBe(1)
    expect(cache.store.size).toBe(1)
  })

  test("keeps request origins in separate cache entries", async () => {
    const cache = new InMemoryCache()
    globalWithCaches.caches = { default: cache } as unknown as CacheStorage

    let renderCount = 0
    const firstOriginRequest = new Request("https://email-generator.test/openapi", {
      headers: { Origin: "https://first.example" },
    })
    const secondOriginRequest = new Request("https://email-generator.test/openapi", {
      headers: { Origin: "https://second.example" },
    })

    const firstExecutionContext = createExecutionContext()
    const firstResponse = await fetchWithWorkerCache(
      firstOriginRequest,
      createEnv("deploy-a"),
      firstExecutionContext.ctx,
      async () => {
        renderCount += 1
        return Response.json({ renderCount })
      },
    )
    await firstExecutionContext.flushWaitUntil()

    const secondExecutionContext = createExecutionContext()
    const secondResponse = await fetchWithWorkerCache(
      secondOriginRequest,
      createEnv("deploy-a"),
      secondExecutionContext.ctx,
      async () => {
        renderCount += 1
        return Response.json({ renderCount })
      },
    )
    await secondExecutionContext.flushWaitUntil()

    expect(firstResponse.headers.get(workerCacheStatusHeader)).toBe("MISS")
    expect(secondResponse.headers.get(workerCacheStatusHeader)).toBe("MISS")
    expect(renderCount).toBe(2)
    expect(cache.store.size).toBe(2)
  })

  test("bypasses documentation GETs with authorization or cookies", async () => {
    const cache = new InMemoryCache()
    globalWithCaches.caches = { default: cache } as unknown as CacheStorage

    let renderCount = 0
    const authenticatedHeaders: HeadersInit[] = [{ Authorization: "Bearer token" }, { Cookie: "session=abc" }]
    for (const headers of authenticatedHeaders) {
      const executionContext = createExecutionContext()
      const response = await fetchWithWorkerCache(
        new Request("https://email-generator.test/openapi", { headers }),
        createEnv("deploy-a"),
        executionContext.ctx,
        async () => {
          renderCount += 1
          return Response.json({ renderCount })
        },
      )
      await executionContext.flushWaitUntil()

      expect(response.headers.get(workerCacheStatusHeader)).toBe("BYPASS")
    }

    expect(renderCount).toBe(2)
    expect(cache.store.size).toBe(0)
  })

  test("bypasses non-GET requests", async () => {
    const cache = new InMemoryCache()
    globalWithCaches.caches = { default: cache } as unknown as CacheStorage

    const executionContext = createExecutionContext()
    const response = await fetchWithWorkerCache(
      new Request("https://email-generator.test/renderEmailTemplate/signInV1", { method: "POST" }),
      createEnv("deploy-a"),
      executionContext.ctx,
      async () => Response.json({ ok: true }),
    )
    await executionContext.flushWaitUntil()

    expect(response.headers.get(workerCacheStatusHeader)).toBe("BYPASS")
    expect(cache.store.size).toBe(0)
  })
})
