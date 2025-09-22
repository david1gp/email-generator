import type { RenderedEmail } from "@/render/RenderedEmail"
import { renderRegisterEmail } from "@/render/renderRegisterEmail"
import { registerEmailSchema } from "@/templates/registerEmailSchema"

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
  name: "registerEmailV1",
  schema: registerEmailSchema,
  renderFn: renderRegisterEmail,
}

export const apiRouteDef = [apiDefRegisterEmailV1, apiDefLoginCodeV1] as const satisfies ApiRouteDef[]
