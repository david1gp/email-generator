import { expect, test } from "bun:test"
import { apiGenerateEmailLoginCodeV1 } from "~/apiGenerateEmail"
import type { LoginCodeV1Type } from "~/LoginCodeV1Type"
import { getTargetBaseUrl, targetEnv } from "./targetEnv"

const exampleProps = {
  l: "en",
  code: "123456",
  url: "https://example.com/verify?code=123456",
  homepageText: "Home",
  homepageUrl: "https://example.com",
  mottoText: "Welcome to our service",
} as const satisfies LoginCodeV1Type

async function testFn() {
  const baseUrl = getTargetBaseUrl(targetEnv.readFromEnv)
  const result = await apiGenerateEmailLoginCodeV1(exampleProps, baseUrl)

  if (!result.success) {
    console.error(result)
  }
  expect(result.success).toBeTruthy()
  if (!result.success) return
  const data = result.data
  expect(data.html).toContain(exampleProps.code)
  expect(data.text).toContain(exampleProps.code)
}

const name = "apiGenerateEmailLoginCodeV1"
if (process.env.CI) {
  test.skip(name, testFn)
} else {
  test(name, testFn)
}
