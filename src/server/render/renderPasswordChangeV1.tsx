import { tt0, tt1 } from "../../i18n/tt0.js"
import PasswordChangeV1Template from "../../templates/password_change/PasswordChangeV1Template.js"
import { t4passwordChange } from "../../templates/password_change/t4passwordChange.js"
import { render } from "@react-email/render"
import { language } from "../../../client/i18n/language.js"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType.js"
import type { PasswordChangeV1Type } from "../../../client/types/PasswordChangeV1Type.js"

export async function renderPasswordChangeV1(p: PasswordChangeV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt1(l, t4passwordChange.Password_change_code_x, p.code)
  return {
    subject,
    text: await render(<PasswordChangeV1Template {...p} />, { plainText: true }),
    html: await render(<PasswordChangeV1Template {...p} />),
  }
}