import RegisterEmailV1Template from "@/templates/RegisterEmailV1Template"
import { render } from "@react-email/render"
import type { GeneratedEmailType } from "~/GeneratedEmailType"
import type { RegisterEmailV1Type } from "~/registerEmailV1Schema"

export async function renderRegisterEmail(p: RegisterEmailV1Type): Promise<GeneratedEmailType> {
  return {
    text: await render(<RegisterEmailV1Template {...p} />, { plainText: true }),
    html: await render(<RegisterEmailV1Template {...p} />),
  }
}
