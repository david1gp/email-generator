import { getPackageVersion } from "../../../ops/getPackageVersion.js"
import type { HonoContext } from "../../../utils/HonoContext.js"

export async function versionHandler(c: HonoContext): Promise<Response> {
  return c.text(c.env?.VERSION ?? getPackageVersion(), 200, {
    "Content-Type": "text/plain",
  })
}
