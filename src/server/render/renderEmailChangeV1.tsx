import { tt0, tt1 } from "@/i18n/tt0"
import EmailChangeV1Template from "@/templates/email_change/EmailChangeV1Template"
import { t4emailChange } from "@/templates/email_change/t4emailChange"
import { render } from "@react-email/render"
import { language } from "~/i18n/language"
import type { GeneratedEmailType } from "~/types/GeneratedEmailType"
import type { EmailChangeV1Type } from "~/types/EmailChangeV1Type"

export async function renderEmailChangeV1(p: EmailChangeV1Type): Promise<GeneratedEmailType> {
  const l = p.l ?? language.en
  const subject = tt1(l, t4emailChange.Email_change_verification_code_x, p.code)
  return {
    subject,
    text: await render(<EmailChangeV1Template {...p} />, { plainText: true }),
    html: await render(<EmailChangeV1Template {...p} />),
  }
}