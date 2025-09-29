import type { EmailTemplate } from "~/emailTemplate"
import type { GeneratedEmailType } from "~/GeneratedEmailType"


export type ApiRouteDef = {
  name: EmailTemplate
  schema: any
  renderFn: (props: any) => Promise<GeneratedEmailType>
}
