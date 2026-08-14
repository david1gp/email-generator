import type { FooterV1Type } from "../../client/index.js"
import { footerV1ExampleData } from "./footerV1ExampleData.js"

export const footerV1LegalExampleData = {
  ...footerV1ExampleData,
  legalCompanySignature: `Nordlicht Software GmbH
Friedrichstraße 123
10117 Berlin, Deutschland
Amtsgericht Charlottenburg, HRB 234567 B
Geschäftsführung: Anna Beispiel
USt-IdNr.: DE123456789`,
} as const satisfies FooterV1Type
