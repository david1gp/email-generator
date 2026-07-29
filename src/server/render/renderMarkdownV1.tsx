import { render, toPlainText } from "@react-email/render"
import type { GeneratedEmailType } from "../../../client/types/GeneratedEmailType.js"
import type { MarkdownV1Type } from "../../../client/types/MarkdownV1Type.js"
import MarkdownV1Template from "../../templates/markdown/MarkdownV1Template.js"

export async function renderMarkdownV1(p: MarkdownV1Type): Promise<GeneratedEmailType> {
  const subject = p.subject
  const html = await render(<MarkdownV1Template {...p} />)
  const text = toPlainText(html, {
    selectors: [{ selector: "[data-id=react-email-markdown]>table", format: "dataTable" }],
  })
  return { subject, text, html }
}
