import { emailTemplateName } from "../../../client/emailTemplateName.js"
import type {
  EmailChangeV1Type,
  InvitationV1Type,
  InvoiceV1Type,
  MarkdownV1Type,
  PasswordChangeV1Type,
  SignInV1Type,
  SignUpV1Type,
} from "../../../client/index.js"
import { renderEmailChangeV1 } from "../render/renderEmailChangeV1.js"
import { renderInvitationV1 } from "../render/renderInvitationV1.js"
import { renderInvoiceV1 } from "../render/renderInvoiceV1.js"
import { renderMarkdownV1 } from "../render/renderMarkdownV1.js"
import { renderPasswordChangeV1 } from "../render/renderPasswordChangeV1.js"
import { renderSignInV1 } from "../render/renderSignInV1.js"
import { renderSignUpV1 } from "../render/renderSignUpV1.js"
import { emailChangeV1Schema } from "../schemas/emailChangeV1Schema.js"
import { invoiceV1Schema } from "../schemas/invoiceV1Schema.js"
import { markdownV1Schema } from "../schemas/markdownV1Schema.js"
import { invitationV1Schema } from "../schemas/orgInvitationV1Schema.js"
import { passwordChangeV1Schema } from "../schemas/passwordChangeV1Schema.js"
import { signInV1Schema } from "../schemas/signInV1Schema.js"
import { signUpV1Schema } from "../schemas/signUpV1Schema.js"
import { type ApiRouteDefType } from "./ApiRouteDefType.js"

export const apiDefRegisterEmailV1 = {
  name: emailTemplateName.signUpV1,
  schema: signUpV1Schema,
  renderFn: renderSignUpV1,
} as const satisfies ApiRouteDefType<SignUpV1Type>

export const apiDefLoginCodeV1 = {
  name: emailTemplateName.signInV1,
  schema: signInV1Schema,
  renderFn: renderSignInV1,
} as const satisfies ApiRouteDefType<SignInV1Type>

export const apiDefOrgInvitationV1 = {
  name: emailTemplateName.orgInvitationV1,
  schema: invitationV1Schema,
  renderFn: renderInvitationV1,
} as const satisfies ApiRouteDefType<InvitationV1Type>

export const apiDefInvitationV1 = {
  name: emailTemplateName.invitationV1,
  schema: invitationV1Schema,
  renderFn: renderInvitationV1,
} as const satisfies ApiRouteDefType<InvitationV1Type>

export const apiDefPasswordChangeV1 = {
  name: emailTemplateName.passwordChangeV1,
  schema: passwordChangeV1Schema,
  renderFn: renderPasswordChangeV1,
} as const satisfies ApiRouteDefType<PasswordChangeV1Type>

export const apiDefEmailChangeV1 = {
  name: emailTemplateName.emailChangeV1,
  schema: emailChangeV1Schema,
  renderFn: renderEmailChangeV1,
} as const satisfies ApiRouteDefType<EmailChangeV1Type>

export const apiDefTeamInvitationV1 = {
  name: emailTemplateName.teamInvitationV1,
  schema: invitationV1Schema,
  renderFn: renderInvitationV1,
} as const satisfies ApiRouteDefType<InvitationV1Type>

export const apiDefInvoiceV1 = {
  name: emailTemplateName.invoiceV1,
  schema: invoiceV1Schema,
  renderFn: renderInvoiceV1,
} as const satisfies ApiRouteDefType<InvoiceV1Type>

export const apiDefMarkdownV1 = {
  name: emailTemplateName.markdownV1,
  schema: markdownV1Schema,
  renderFn: renderMarkdownV1,
  requiresBearerAuth: true,
  maxBodyBytes: 32768,
} as const satisfies ApiRouteDefType<MarkdownV1Type>

export const apiRouteDef = [
  apiDefRegisterEmailV1,
  apiDefLoginCodeV1,
  apiDefInvitationV1,
  apiDefOrgInvitationV1,
  apiDefTeamInvitationV1,
  apiDefPasswordChangeV1,
  apiDefEmailChangeV1,
  apiDefInvoiceV1,
  apiDefMarkdownV1,
] as const satisfies readonly ApiRouteDefType<any>[]
