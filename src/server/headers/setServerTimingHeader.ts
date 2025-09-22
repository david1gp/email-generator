export type ServerTimingValues = {
  name: string
  amount: number
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing
 */
export function setServerTimingHeader(r: Response, values: ServerTimingValues[]): Response {
  const headerValue = values.map((v) => v.name + ";dur=" + Math.trunc(v.amount)).join(", ")
  r.headers.set("Server-Timing", headerValue)
  return r
}

export function setServerTimingHeaderSingleValue(
  r: Response,
  op: string,
  startedAt: number,
  endetAt: number = performance.now(),
): Response {
  const values: ServerTimingValues[] = [{ name: op, amount: Math.trunc(endetAt - startedAt) }]
  setServerTimingHeader(r, values)
  return r
}
