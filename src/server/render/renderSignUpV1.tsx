import { tt1 } from "@/i18n/tt0"
import SignUpV1Template from "@/templates/sign_up/SignUpV1Template"
import { t4signUp } from "@/templates/sign_up/t4signUp"
import { render } from "@react-email/render"
import { language } from "~/i18n/language"
import type { GeneratedEmailType } from "~/types/GeneratedEmailType"
import type { SignUpV1Type } from "~/types/SignUpV1Type"

export async function renderSignUpV1(p: SignUpV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt1(l, t4signUp.Your_signup_code_x, p.code)
  return {
    subject,
    text: await render(<SignUpV1Template {...p} />, { plainText: true }),
    html: await render(<SignUpV1Template {...p} />),
  }
}
