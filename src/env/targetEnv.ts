import { serverPortBun } from "@/server/serverPortBun"
import { serverPortWrangler } from "@/server/serverPortWrangler"

export type TargetEnv = keyof typeof targetEnv

export const targetEnv = {
  localhostBun: "http://localhost:" + serverPortBun,
  localhostWorker: "http://localhost:" + serverPortWrangler,
  readFromEnv: readFromEnv(),
} as const

function readFromEnv(): string {
  const read = process.env.EMAIL_GENERATOR_URL
  if (!read) {
    console.error("env.EMAIL_GENERATOR_URL missing / not set")
    process.exit(1)
  }
  return read
}
