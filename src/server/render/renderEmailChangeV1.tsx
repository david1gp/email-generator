import { render } from "@react-email/render"
import { language } from "../../../client/i18n/language.js"
import type { EmailChangeV1Type } from "../../../client/types/EmailChangeV1Type.js"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType.js"
import { tt1 } from "../../i18n/tt0.js"
import EmailChangeV1Template from "../../templates/email_change/EmailChangeV1Template.js"
import { t4emailChange } from "../../templates/email_change/t4emailChange.js"

export async function renderEmailChangeV1(p: EmailChangeV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = p.subject ?? tt1(l, t4emailChange.Email_change_verification_code_x, p.code)
  return {
    subject,
    text: await render(<EmailChangeV1Template {...p} />, { plainText: true }),
    html: await render(<EmailChangeV1Template {...p} />),
  }
}
