#!/usr/bin/env bun

import { copyFile, readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { getPackageVersion } from "../src/ops/getPackageVersion.js"
import { getEnvTargets } from "./getEnvTargets.js"

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const wranglerBin = join(projectRoot, "node_modules", ".bin", "wrangler")

// Run the function if script is executed directly
// @ts-ignore
if (import.meta.main) {
  deployAllEnvironments()
}

async function deployAllEnvironments() {
  const targets = await getEnvTargets()

  if (targets.length === 0) {
    console.log("No deploy environments found")
    return
  }

  const packageVersion = getPackageVersion()

  console.log(`Found environments: ${targets.map((target) => target.name).join(", ")}`)
  console.log(`Deploying version: ${packageVersion}`)
  console.log("")

  for (const target of targets) {
    console.log(`Deploying environment: ${target.name}`)

    await copyFile(join(projectRoot, target.envFile), join(projectRoot, ".env"))
    const env = normalizeWranglerEnv({
      ...Bun.env,
      ...(await readEnvFile(target.envFile)),
    })

    const process = Bun.spawn(
      [wranglerBin, "deploy", "--var", `VERSION:${packageVersion}`, "--config", target.wranglerConfig],
      {
        cwd: projectRoot,
        env,
        stdout: "inherit",
        stderr: "inherit",
      },
    )

    const exitCode = await process.exited
    if (exitCode === 0) {
      console.log(`Successfully deployed ${target.name}`)
    } else {
      throw new Error(`Failed to deploy ${target.name} (exit code: ${exitCode})`)
    }

    console.log("")
  }
}

async function readEnvFile(fileName: string): Promise<Record<string, string>> {
  const contents = await readFile(join(projectRoot, fileName), "utf8")
  const env: Record<string, string> = {}

  for (const line of contents.split("\n")) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf("=")

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmedLine
      .slice(0, separatorIndex)
      .replace(/^export\s+/, "")
      .trim()
    let value = trimmedLine.slice(separatorIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

function normalizeWranglerEnv(env: NodeJS.ProcessEnv): Record<string, string> {
  const normalized = Object.fromEntries(
    Object.entries(env).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  )

  if (normalized.WRANGLER_SEND_METRICS === "0") {
    normalized.WRANGLER_SEND_METRICS = "false"
  }

  if (normalized.WRANGLER_SEND_METRICS === "1") {
    normalized.WRANGLER_SEND_METRICS = "true"
  }

  return normalized
}
