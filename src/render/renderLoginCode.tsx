import type { RenderedEmail } from "@/render/RenderedEmail"
import LoginCode, { type LoginCodeProps } from "@/templates/LoginCode"
import { render } from "@react-email/render"

export async function renderLoginCode(p: LoginCodeProps): Promise<RenderedEmail> {
  return {
    text: await render(<LoginCode {...p} />, { plainText: true }),
    html: await render(<LoginCode {...p} />),
  }
}
