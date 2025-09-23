import { serverPortBun } from "@/server/serverPortBun"
import { serverPortWrangler } from "@/server/serverPortWrangler"

export type TargetEnv = keyof typeof targetEnv

export const targetEnv = {
  localhostBun: "http://localhost:" + serverPortBun,
  localhostWorker: "http://localhost:" + serverPortWrangler,
  productionWorker: "",
} as const
