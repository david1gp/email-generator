import type { PromiseResult } from "@adaptive-ds/result"
import { emailTemplateName } from "./emailTemplateName.js"
import { generateEmailApiCall } from "./generateEmailApiCall.js"
import type { GeneratedEmailType } from "./types/GeneratedEmailType.js"
import type { InvoiceV1Type } from "./types/InvoiceV1Type.js"

export async function apiGenerateEmailInvoiceV1(
  props: InvoiceV1Type,
  baseUrl: string,
): PromiseResult<GeneratedEmailType> {
  const op = "apiGenerateEmailInvoiceV1"
  return generateEmailApiCall(op, emailTemplateName.invoiceV1, props, baseUrl)
}
