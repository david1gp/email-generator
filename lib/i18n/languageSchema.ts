import * as v from "valibot"
import { language } from "~/i18n/language"

export const languageSchema = v.enum(language);
