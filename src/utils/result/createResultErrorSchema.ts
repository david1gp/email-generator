import { type ResultErr, createResultError } from "@/utils/result/Result"
import * as v from "valibot"

export function createResultErrorSchema(op: string, valibotError: v.ValiError<any>, errorData?: string): ResultErr {
  const errorMessage = v.summarize(valibotError.issues)
  return createResultError(op, errorMessage, errorData)
}
