import type { RenderedEmail } from "@/render/RenderedEmail"
import RegisterEmailTemplate from "@/templates/RegisterEmailTemplate"
import type { RegisterEmailProps } from "@/templates/registerEmailSchema"
import { render } from "@react-email/render"

export async function renderRegisterEmail(p: RegisterEmailProps): Promise<RenderedEmail> {
  return {
    text: await render(<RegisterEmailTemplate {...p} />, { plainText: true }),
    html: await render(<RegisterEmailTemplate {...p} />),
  }
}
