import LoginCodeV1Template from "@/templates/LoginCodeV1Template"
import { render } from "@react-email/render"
import type { GeneratedEmailType } from "~/GeneratedEmailType"
import type { LoginCodeV1Type } from "~/loginCodeV1Schema"

export async function renderLoginCode(p: LoginCodeV1Type): Promise<GeneratedEmailType> {
  return {
    text: await render(<LoginCodeV1Template {...p} />, { plainText: true }),
    html: await render(<LoginCodeV1Template {...p} />),
  }
}
