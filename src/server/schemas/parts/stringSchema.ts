import * as v from "valibot"

export const stringSchema = v.pipe(v.string(), v.trim(), v.maxLength(100))
export const stringSchema500 = v.pipe(v.string(), v.trim(), v.maxLength(500))
