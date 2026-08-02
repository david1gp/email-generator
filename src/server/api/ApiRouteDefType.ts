import type { BaseIssue, BaseSchema } from "valibot"
import type { EmailTemplateName } from "../../../client/emailTemplateName.js"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType.js"

export type ApiRouteDefType<T> = {
  name: EmailTemplateName
  schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>
  renderFn: (props: T) => Promise<GeneratedEmailType>
  requiresBearerAuth?: boolean
  maxBodyBytes?: number
}
