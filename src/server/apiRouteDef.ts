import type { RenderedEmail } from "@/render/RenderedEmail"
import { renderRegisterEmail } from "@/render/renderRegisterEmail"
import { renderLoginCode } from "@/render/renderLoginCode"
import { registerEmailSchema } from "@/templates/registerEmailSchema"
import { loginCodeSchema } from "@/templates/loginCodeSchema"

export type ApiRouteDef = {
  schema: any
  renderFn: (props: any) => Promise<RenderedEmail>
  name: string
}

export const apiDefRegisterEmailV1 = {
  name: "registerEmailV1",
  schema: registerEmailSchema,
  renderFn: renderRegisterEmail,
}

export const apiDefLoginCodeV1 = {
  name: "loginCodeV1",
  schema: loginCodeSchema,
  renderFn: renderLoginCode,
}

export const apiRouteDef = [apiDefRegisterEmailV1, apiDefLoginCodeV1] as const satisfies ApiRouteDef[]
