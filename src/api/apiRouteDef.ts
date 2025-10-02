import { renderLoginCode } from "@/render/renderLoginCode"
import { renderRegisterEmail } from "@/render/renderRegisterEmail"
import { type ApiRouteDef } from "~/ApiRouteDef"
import { emailTemplateName } from "~/emailTemplateName"
import { loginCodeV1Schema } from "~/loginCodeV1Schema"
import { registerEmailV1Schema } from "~/registerEmailV1Schema"

export const apiDefRegisterEmailV1 = {
  name: emailTemplateName.registerEmailV1,
  schema: registerEmailV1Schema,
  renderFn: renderRegisterEmail,
}

export const apiDefLoginCodeV1 = {
  name: emailTemplateName.loginCodeV1,
  schema: loginCodeV1Schema,
  renderFn: renderLoginCode,
}

export const apiRouteDef = [apiDefRegisterEmailV1, apiDefLoginCodeV1] as const satisfies ApiRouteDef[]
