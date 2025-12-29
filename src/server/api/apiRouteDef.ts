import { type ApiRouteDefType } from "@/server/api/ApiRouteDefType"
import { renderEmailChangeV1 } from "@/server/render/renderEmailChangeV1"
import { renderOrgInvitationV1 } from "@/server/render/renderOrgInvitationV1"
import { renderPasswordChangeV1 } from "@/server/render/renderPasswordChangeV1"
import { renderSignInV1 } from "@/server/render/renderSignInV1"
import { renderSignUpV1 } from "@/server/render/renderSignUpV1"
import { emailChangeV1Schema } from "@/server/schemas/emailChangeV1Schema"
import { orgInvitationV1Schema } from "@/server/schemas/orgInvitationV1Schema"
import { passwordChangeV1Schema } from "@/server/schemas/passwordChangeV1Schema"
import { signInV1Schema } from "@/server/schemas/signInV1Schema"
import { signUpV1Schema } from "@/server/schemas/signUpV1Schema"
import { emailTemplateName } from "~/emailTemplateName"

export const apiDefRegisterEmailV1 = {
  name: emailTemplateName.signUpV1,
  schema: signUpV1Schema,
  renderFn: renderSignUpV1,
}

export const apiDefLoginCodeV1 = {
  name: emailTemplateName.signInV1,
  schema: signInV1Schema,
  renderFn: renderSignInV1,
}

export const apiDefOrgInvitationV1 = {
  name: emailTemplateName.orgInvitationV1,
  schema: orgInvitationV1Schema,
  renderFn: renderOrgInvitationV1,
}

export const apiDefPasswordChangeV1 = {
  name: emailTemplateName.passwordChangeV1,
  schema: passwordChangeV1Schema,
  renderFn: renderPasswordChangeV1,
}

export const apiDefEmailChangeV1 = {
  name: emailTemplateName.emailChangeV1,
  schema: emailChangeV1Schema,
  renderFn: renderEmailChangeV1,
}

export const apiRouteDef = [
  apiDefRegisterEmailV1,
  apiDefLoginCodeV1,
  apiDefOrgInvitationV1,
  apiDefPasswordChangeV1,
  apiDefEmailChangeV1,
] as const satisfies ApiRouteDefType[]
