import * as a from "valibot"

export const stringSchema = a.pipe(a.string(), a.trim(), a.maxLength(100))
export const stringSchema500 = a.pipe(a.string(), a.trim(), a.maxLength(5000))
