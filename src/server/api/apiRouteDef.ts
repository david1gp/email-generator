import { type ApiRouteDefType } from "@/server/api/ApiRouteDefType"
import { renderOrgInvitationV1 } from "@/server/render/renderOrgInvitationV1"
import { renderSignInV1 } from "@/server/render/renderSignInV1"
import { renderSignUpV1 } from "@/server/render/renderSignUpV1"
import { orgInvitationV1Schema } from "@/server/schemas/orgInvitationV1Schema"
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

export const apiRouteDef = [
  apiDefRegisterEmailV1,
  apiDefLoginCodeV1,
  apiDefOrgInvitationV1,
] as const satisfies ApiRouteDefType[]
