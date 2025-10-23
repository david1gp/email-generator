import { type ServerTimingValues, setHeaderTiming } from "@/server/headers/setHeaderTiming"

export function setHeaderTimingSingleValue(
  r: Response,
  op: string,
  startedAt: number,
  endetAt: number = performance.now(),
): Response {
  const values: ServerTimingValues[] = [{ name: op, amount: Math.trunc(endetAt - startedAt) }]
  setHeaderTiming(r, values)
  return r
}
