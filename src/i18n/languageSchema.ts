import { language } from "@/i18n/language"
import * as v from "valibot"

export const languageSchema = v.enum(language);
