export function setHeaderVersion(r: Response, version: string): Response {
  r.headers.set("X-Version", version)
  return r
}
