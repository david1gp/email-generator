import { setHeaderTiming } from "@/server/headers/setHeaderTiming"
import { createResultError } from "@adaptive-ds/result"
import type { GeneratedEmailType } from "@client/types/GeneratedEmailType"
import * as a from "valibot"

export async function handleRenderRequest(
  req: Request,
  schema: any,
  renderFn: (props: any) => Promise<GeneratedEmailType>,
  op: string,
): Promise<Response> {
  const opParsingInput = "parseSchema"
  const opRenderingTemplate = "renderTemplate"

  const jsonText = await req.text()
  if (!jsonText) {
    const error = createResultError(op, "Missing JSON body")
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
  const jsonSchema = a.pipe(a.string(), a.parseJson(), schema)
  const startParsing = performance.now()
  const jsonParsing = a.safeParse(jsonSchema, jsonText)
  if (!jsonParsing.success) {
    const endParsing = performance.now()
    const parsingDuration = endParsing - startParsing
    const errorMessage = a.summarize(jsonParsing.issues)
    const errorResult = createResultError(op, errorMessage)
    const response = new Response(JSON.stringify(errorResult), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
    return setHeaderTiming(response, [{ name: opParsingInput, amount: Math.trunc(parsingDuration) }])
  }
  const endParsing = performance.now()
  const parsingDuration = endParsing - startParsing
  const validated = jsonParsing.output
  const startRendering = performance.now()
  const rendered = await renderFn(validated)
  const endRendering = performance.now()
  const renderingDuration = endRendering - startRendering
  const response = new Response(JSON.stringify(rendered), {
    headers: { "Content-Type": "application/json" },
  })
  return setHeaderTiming(response, [
    { name: opParsingInput, amount: Math.trunc(parsingDuration) },
    { name: opRenderingTemplate, amount: Math.trunc(renderingDuration) },
  ])
}
