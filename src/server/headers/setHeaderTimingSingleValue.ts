export function setHeaderTimingSingleValue(
  r: Response,
  op: string,
  startedAt: number,
  endedAt: number = Date.now(),
): Response {
  const amount = Math.trunc(endedAt - startedAt)
  r.headers.set("Server-Timing", `${op};dur=${amount}`)
  return r
}
