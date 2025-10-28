import { tt1 } from "@/i18n/tt0"
import LoginCodeV1Template from "@/templates/LoginCodeV1Template"
import { t4emailSignIn } from "@/templates/t4emailSignIn"
import { render } from "@react-email/render"
import type { GeneratedEmailType } from "~/GeneratedEmailType"
import { language } from "~/i18n/language"
import type { LoginCodeV1Type } from "~/LoginCodeV1Type"

export async function renderLoginCode(p: LoginCodeV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt1(l, t4emailSignIn.Sign_in_title_x, p.code)
  return {
    subject,
    text: await render(<LoginCodeV1Template {...p} />, { plainText: true }),
    html: await render(<LoginCodeV1Template {...p} />),
  }
}
