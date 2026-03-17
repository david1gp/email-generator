import type { BaseIssue, BaseSchema } from "valibot"
import type { EmailTemplateName } from "../../../client/emailTemplateName"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType"

export type ApiRouteDefType<T> = {
  name: EmailTemplateName
  schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>
  renderFn: (props: T) => Promise<GeneratedEmailType>
}
