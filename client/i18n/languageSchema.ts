import * as v from "valibot"
import { language } from "./language"

export const languageSchema = v.enum(language)
