import { renderLoginCode } from "@/render/renderLoginCode"
import { renderRegisterEmail } from "@/render/renderRegisterEmail"
import type { GeneratedEmailType } from "~/GeneratedEmailType"
import { loginCodeV1Schema } from "~/loginCodeV1Schema"
import { registerEmailV1Schema } from "~/registerEmailV1Schema"

export type ApiRouteDef = {
  schema: any
  renderFn: (props: any) => Promise<GeneratedEmailType>
  name: string
}

export const apiRoutePathGenerateEmail = "renderEmailTemplate"

export const apiDefRegisterEmailV1 = {
  name: "registerEmailV1",
  schema: registerEmailV1Schema,
  renderFn: renderRegisterEmail,
}

export const apiDefLoginCodeV1 = {
  name: "loginCodeV1",
  schema: loginCodeV1Schema,
  renderFn: renderLoginCode,
}

export const apiRouteDef = [apiDefRegisterEmailV1, apiDefLoginCodeV1] as const satisfies ApiRouteDef[]
