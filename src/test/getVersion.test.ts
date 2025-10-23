import { getPackageVersion } from "@/ops/getPackageVersion"
import { expect, test } from "bun:test"
import { getTargetBaseUrl, targetEnv } from "./targetEnv"

async function testFn() {
  const response = await fetch(getTargetBaseUrl(targetEnv.readFromEnv) + "/" + "version", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (!response.ok) {
    console.log(response.status)
    console.log(response.statusText)
  }
  expect(response.ok).toBe(true)
  expect(response.status).toBe(200)

  const versionText = await response.text()
  const expectedVersion = getPackageVersion()
  if (versionText !== expectedVersion) {
    console.log(versionText)
    console.log(response)
  }
  expect(versionText).toBe(expectedVersion)
}

const name = "getVersion"
if (process.env.CI) {
  test.skip(name, testFn)
} else {
  test(name, testFn)
}
