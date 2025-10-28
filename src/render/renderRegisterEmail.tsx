import { tt1 } from "@/i18n/tt0"
import RegisterEmailV1Template from "@/templates/RegisterEmailV1Template"
import { t4emailSignUp } from "@/templates/t4emailSignUp"
import { render } from "@react-email/render"
import type { GeneratedEmailType } from "~/GeneratedEmailType"
import { language } from "~/i18n/language"
import type { RegisterEmailV1Type } from "~/RegisterEmailV1Type"

export async function renderRegisterEmail(p: RegisterEmailV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt1(l, t4emailSignUp.Sign_up_title_x, p.code)
  return {
    subject,
    text: await render(<RegisterEmailV1Template {...p} />, { plainText: true }),
    html: await render(<RegisterEmailV1Template {...p} />),
  }
}
