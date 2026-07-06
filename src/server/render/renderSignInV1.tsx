import { render } from "@react-email/render"
import { language } from "../../../client/i18n/language.js"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType.js"
import type { SignInV1Type } from "../../../client/types/SignInV1Type.js"
import { tt1 } from "../../i18n/tt0.js"
import SignInV1Template from "../../templates/sign_in/SignInV1Template.js"
import { t4signIn } from "../../templates/sign_in/t4signIn.js"

export async function renderSignInV1(p: SignInV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt1(l, t4signIn.Your_Sign_in_code_x, p.code)
  return {
    subject,
    text: await render(<SignInV1Template {...p} />, { plainText: true }),
    html: await render(<SignInV1Template {...p} />),
  }
}
