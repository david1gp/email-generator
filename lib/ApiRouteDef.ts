import type { EmailTemplateName } from "~/emailTemplateName"
import type { GeneratedEmailType } from "~/GeneratedEmailType"

export type ApiRouteDef = {
  name: EmailTemplateName
  schema: any
  renderFn: (props: any) => Promise<GeneratedEmailType>
}
