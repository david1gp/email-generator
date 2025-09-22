import { apiDefLoginCodeV1 } from "@/server/apiRouteDef"
import { serverPort } from "@/server/serverPort"
import { describe, expect, test } from "bun:test"
import * as v from "valibot"

const successResponseSchema = v.object({
  success: v.literal(true),
  data: v.object({
    text: v.string(),
    html: v.string(),
  }),
})

type SuccessResponse = v.InferOutput<typeof successResponseSchema>

const testProps = {
  l: "en",
  code: "123456",
  url: "https://example.com/verify?code=123456",
  homepageText: "Home",
  homepageUrl: "https://example.com",
  mottoText: "Welcome to our service",
}

describe("API Render Login Code", () => {
  test("should render email template and contain code in response", async () => {
    const response = await fetch("http://localhost:" + serverPort + "/renderEmailTemplate/" + apiDefLoginCodeV1.name, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testProps),
    })

    expect(response.ok).toBe(true)
    expect(response.status).toBe(200)

    const res = (await response.json()) as unknown

    const validation = v.safeParse(successResponseSchema, res)
    expect(validation.success).toBe(true)

    const validatedRes = validation.output as SuccessResponse
    expect(validatedRes.data.html).toContain("123456")
    expect(validatedRes.data.text).toContain("123456")
  })
})
