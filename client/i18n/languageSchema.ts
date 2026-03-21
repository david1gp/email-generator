import * as a from "valibot"
import { language } from "./language.js"

export const languageSchema = a.enum(language)
