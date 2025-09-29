import * as v from "valibot"
import { type ResultErr, createResultError } from "~/result/Result"

export function createResultErrorSchema(op: string, valibotError: v.ValiError<any>, errorData?: string): ResultErr {
  const errorMessage = v.summarize(valibotError.issues)
  return createResultError(op, errorMessage, errorData)
}
