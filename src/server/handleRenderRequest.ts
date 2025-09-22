import type { RenderedEmail } from "@/render/RenderedEmail"
import { createResult, createResultError } from "@/utils/result/Result"
import * as v from "valibot"

export async function handleRenderRequest(
  req: Request,
  schema: any,
  renderFn: (props: any) => Promise<RenderedEmail>,
  op: string,
): Promise<Response> {
  const jsonText = await req.text()
  if (!jsonText) {
    const error = createResultError(op, "Missing JSON body")
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
  const jsonSchema = v.pipe(v.string(), v.parseJson(), schema)
  const jsonParsing = v.safeParse(jsonSchema, jsonText)
  if (!jsonParsing.success) {
    const errorMessage = v.summarize(jsonParsing.issues)
    const error = createResultError(op, errorMessage)
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
  const validated = jsonParsing.output
  const rendered = await renderFn(validated)
  const result = createResult(rendered)
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  })
}
