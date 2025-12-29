import { tt0, tt1 } from "@/i18n/tt0"
import PasswordChangeV1Template from "@/templates/password_change/PasswordChangeV1Template"
import { t4passwordChange } from "@/templates/password_change/t4passwordChange"
import { render } from "@react-email/render"
import { language } from "~/i18n/language"
import type { GeneratedEmailType } from "~/types/GeneratedEmailType"
import type { PasswordChangeV1Type } from "~/types/PasswordChangeV1Type"

export async function renderPasswordChangeV1(p: PasswordChangeV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt1(l, t4passwordChange.Password_change_code_x, p.code)
  return {
    subject,
    text: await render(<PasswordChangeV1Template {...p} />, { plainText: true }),
    html: await render(<PasswordChangeV1Template {...p} />),
  }
}