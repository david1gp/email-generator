import type { RenderedEmail } from "@/render/RenderedEmail"
import { renderLoginCode } from "@/render/renderLoginCode"
import { renderRegisterEmail } from "@/render/renderRegisterEmail"
import { loginCodeSchema } from "@/templates/loginCodeSchema"
import { registerEmailSchema } from "@/templates/registerEmailSchema"

export type ApiRouteDef = {
  schema: any
  renderFn: (props: any) => Promise<RenderedEmail>
  name: string
}

export const apiRouteDef = [
  {
    name: "registerEmailV1",
    schema: registerEmailSchema,
    renderFn: renderRegisterEmail,
  },
  {
    name: "loginCodeV1",
    schema: loginCodeSchema,
    renderFn: renderLoginCode,
  },
] as const satisfies ApiRouteDef[]
