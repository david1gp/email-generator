import type { EmailTemplateName } from "../../../lib/emailTemplateName"
import type { GeneratedEmailType } from "../../../lib/types/GeneratedEmailType"

export type ApiRouteDefType = {
  name: EmailTemplateName
  schema: any
  renderFn: (props: any) => Promise<GeneratedEmailType>
}
