import type { GeneratedEmailType } from "~/GeneratedEmailType"

export type ApiRouteDef = {
  name: EmailTemplate
  schema: any
  renderFn: (props: any) => Promise<GeneratedEmailType>
}

export const apiRoutePathGenerateEmail = "renderEmailTemplate"

export type EmailTemplate = keyof typeof emailTemplates

export const emailTemplates = {
  registerEmailV1: "registerEmailV1",
  loginCodeV1: "loginCodeV1",
} as const
