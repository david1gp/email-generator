import type { RenderedEmail } from "@/render/RenderedEmail"
import { setServerTimingHeader } from "@/server/headers/setServerTimingHeader"
import { createResult, createResultError } from "@/utils/result/Result"
import * as v from "valibot"

export async function handleRenderRequest(
  req: Request,
  schema: any,
  renderFn: (props: any) => Promise<RenderedEmail>,
  op: string,
): Promise<Response> {
  const opParsingInput = "parsingInput"
  const opRenderingTemplate = "renderingTemplate"

  const jsonText = await req.text()
  if (!jsonText) {
    const error = createResultError(op, "Missing JSON body")
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
  const jsonSchema = v.pipe(v.string(), v.parseJson(), schema)
  const startParsing = performance.now()
  const jsonParsing = v.safeParse(jsonSchema, jsonText)
  if (!jsonParsing.success) {
    const endParsing = performance.now()
    const parsingDuration = endParsing - startParsing
    const errorMessage = v.summarize(jsonParsing.issues)
    const errorResult = createResultError(op, errorMessage)
    const response = new Response(JSON.stringify(errorResult), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
    return setServerTimingHeader(response, [{ name: opParsingInput, amount: Math.trunc(parsingDuration) }])
  }
  const endParsing = performance.now()
  const parsingDuration = endParsing - startParsing
  const validated = jsonParsing.output
  const startRendering = performance.now()
  const rendered = await renderFn(validated)
  const endRendering = performance.now()
  const renderingDuration = endRendering - startRendering
  const result = createResult(rendered)
  const response = new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  })
  return setServerTimingHeader(response, [
    { name: opParsingInput, amount: Math.trunc(parsingDuration) },
    { name: opRenderingTemplate, amount: Math.trunc(renderingDuration) },
  ])
}
