import { describe, expect, test } from "bun:test"
import { documentationCacheControl } from "../src/server/cache/workerCache.js"
import { serverPortBun } from "../src/server/ports/serverPortBun.js"

const BASE_URL = `http://localhost:${serverPortBun}`

describe("openapi endpoints", () => {
  test("openapi endpoint returns JSON", async () => {
    const response = await fetch(`${BASE_URL}/openapi`)
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/json")
    expect(response.headers.get("Cache-Control")).toBe(documentationCacheControl)
    const json = (await response.json()) as { openapi: string; info: { title: string } }
    expect(json).toHaveProperty("openapi")
    expect(json).toHaveProperty("info")
    expect(json.info.title).toContain("email-generator")
  })

  test("swagger ui endpoint returns HTML at root", async () => {
    const response = await fetch(`${BASE_URL}/`)
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")?.toLowerCase()).toContain("text/html")
    expect(response.headers.get("Cache-Control")).toBe(documentationCacheControl)
    const html = await response.text()
    expect(html).toContain("swagger-ui")
    expect(html).toContain("/openapi")
  })
})
