import type { RenderedEmail } from "@/render/RenderedEmail"
import RegisterEmail, { type RegisterEmailProps } from "@/templates/RegisterEmail"
import { render } from "@react-email/render"

export async function renderRegisterEmail(p: RegisterEmailProps): Promise<RenderedEmail> {
  return {
    text: await render(<RegisterEmail {...p} />, { plainText: true }),
    html: await render(<RegisterEmail {...p} />),
  }
}
