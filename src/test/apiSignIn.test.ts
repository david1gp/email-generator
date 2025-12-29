import { footerV1ExampleData } from "@/template_parts/footerV1ExampleData"
import { expect, test } from "bun:test"
import { apiGenerateEmailSignInV1 } from "~/apiGenerateEmailSignInV1"
import type { SignInV1Type } from "~/types/SignInV1Type"
import { getTargetBaseUrl, targetEnv } from "./targetEnv"

const exampleProps = {
  l: "en",
  // data
  code: "123456",
  url: "https://example.com/verify?code=123456",
  ...footerV1ExampleData,
} as const satisfies SignInV1Type

async function testFn() {
  const baseUrl = getTargetBaseUrl(targetEnv.readFromEnv)
  const result = await apiGenerateEmailSignInV1(exampleProps, baseUrl)

  if (!result.success) {
    console.error(result)
  }
  expect(result.success).toBeTruthy()
  if (!result.success) return
  const data = result.data
  expect(data.html).toContain(exampleProps.code)
  expect(data.text).toContain(exampleProps.code)
}

const name = "apiSignIn"
if (process.env.CI) {
  test.skip(name, testFn)
} else {
  test(name, testFn)
}
