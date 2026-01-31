import type { BaseIssue, BaseSchema } from "valibot"
import type { EmailTemplateName } from "../../../lib/emailTemplateName"
import type { GeneratedEmailType } from "../../../lib/types/GeneratedEmailType"

export type ApiRouteDefType<T> = {
  name: EmailTemplateName
  schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>
  renderFn: (props: T) => Promise<GeneratedEmailType>
}
