import type { RenderedEmail } from "@/render/RenderedEmail"
import LoginCodeTemplate from "@/templates/LoginCodeTemplate"
import type { LoginCodeProps } from "@/templates/loginCodeSchema"
import { render } from "@react-email/render"

export async function renderLoginCode(p: LoginCodeProps): Promise<RenderedEmail> {
  return {
    text: await render(<LoginCodeTemplate {...p} />, { plainText: true }),
    html: await render(<LoginCodeTemplate {...p} />),
  }
}
