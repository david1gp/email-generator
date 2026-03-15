import * as a from "valibot"
import { language } from "./language"

export const languageSchema = a.enum(language)
