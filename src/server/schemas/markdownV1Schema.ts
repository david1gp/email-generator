import * as a from "valibot"
import { language } from "../../../client/i18n/language.js"
import { languageSchema } from "../../../client/i18n/languageSchema.js"
import type { MarkdownV1Type } from "../../../client/types/MarkdownV1Type.js"
import { footerV1SchemaFields } from "./parts/footerV1SchemaFields.js"

const stringSchema200 = a.pipe(a.string(), a.trim(), a.nonEmpty(), a.maxLength(200))

const subjectSchema = a.pipe(
  a.string(),
  a.trim(),
  a.nonEmpty(),
  a.maxLength(200),
  a.regex(/^[^\r\n]*$/, "Subject must not contain CR/LF"),
)

const markdownSchema = a.pipe(
  a.string(),
  a.nonEmpty(),
  a.maxLength(1000),
  a.check((markdown) => markdown.trim().length > 0, "Markdown must not be blank"),
)

export const markdownV1Schema = a.pipe(
  a.object({
    l: a.fallback(languageSchema, language.en),
    subject: a.pipe(subjectSchema, a.description("Email subject line (plain text, no CR/LF)")),
    preview: a.optional(a.pipe(stringSchema200, a.description("Email preview text"))),
    heading: a.optional(a.pipe(stringSchema200, a.description("Visible heading in email body"))),
    markdown: a.pipe(markdownSchema, a.description("Markdown content body")),
    ...footerV1SchemaFields,
  }),
  a.metadata({
    title: "Markdown Email",
    description: "Markdown email template with paragraphs, bold, links, lists, and two-column tables",
  }),
)

type MarkdownV1SchemaType = a.InferOutput<typeof markdownV1Schema>

function _types1(d: MarkdownV1SchemaType): MarkdownV1Type {
  return { ...d }
}
