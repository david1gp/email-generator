import type { EmailTemplateName } from "./emailTemplateName"
import type { GeneratedEmailType } from "./GeneratedEmailType"

export type ApiRouteDefType = {
  name: EmailTemplateName
  schema: any
  renderFn: (props: any) => Promise<GeneratedEmailType>
}
