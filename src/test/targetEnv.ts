import { serverPortBun } from "@/server/serverPortBun"
import { serverPortWrangler } from "@/server/serverPortWrangler"

export type TargetEnv = keyof typeof targetEnv

export const targetEnv = {
  localhostBun: "localhostBun",
  localhostWorker: "localhostWorker",
  readFromEnv: "readFromEnv",
} as const

export function getTargetBaseUrl(e: TargetEnv): string {
  switch (e) {
    case targetEnv.localhostBun:
      return "http://localhost:" + serverPortBun
    case targetEnv.localhostWorker:
      return "http://localhost:" + serverPortWrangler
    case targetEnv.readFromEnv:
      return readFromEnv()
  }
}

function readFromEnv(): string {
  const read = process.env.EMAIL_GENERATOR_URL
  if (!read) {
    console.error("env.EMAIL_GENERATOR_URL missing / not set")
    process.exit(1)
  }
  return read
}
