import { getPackageVersion } from "@/server/headers/getPackageVersion"

const VERSION = process.env.VERSION || getPackageVersion()

export function setHeaderVersion(r: Response): Response {
  r.headers.set("version", VERSION)
  return r
}
