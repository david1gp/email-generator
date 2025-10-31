import { tt1 } from "@/i18n/tt0"
import SignInV1Template from "@/templates/sign_in/SignInV1Template"
import { t4signIn } from "@/templates/sign_in/t4signIn"
import { render } from "@react-email/render"
import { language } from "~/i18n/language"
import type { GeneratedEmailType } from "~/types/GeneratedEmailType"
import type { SignInV1Type } from "~/types/SignInV1Type"

export async function renderSignInV1(p: SignInV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt1(l, t4signIn.Your_Sign_in_code_x, p.code)
  return {
    subject,
    text: await render(<SignInV1Template {...p} />, { plainText: true }),
    html: await render(<SignInV1Template {...p} />),
  }
}
