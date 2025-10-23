import { getPackageVersion } from "@/server/headers/getPackageVersion"

export function setHeaderVersion(r: Response, version: string = process.env.VERSION || getPackageVersion()): Response {
  r.headers.set("version", version)
  return r
}
