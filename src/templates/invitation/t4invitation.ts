import type { Language } from "../../../client/i18n/language.js"
import type { TranslationBlock } from "../../i18n/TranslationBlock.js"

const invitationT = {
  Join_x2: {
    en: "Join [X1] on [X2]",
    de: "[X1] auf [X2] beitreten",
    ru: "Присоединиться к [X1] на [X2]",
    tj: "Ба [X1] дар [X2] ҳамроҳ шавед",
  },
  Join_x2_p1: {
    en: "Join",
    de: "Beitreten",
    ru: "Присоединиться",
    tj: "Ҳамроҳ шудан",
  },
  Join_x2_p2: {
    en: "in",
    de: "auf",
    ru: "на",
    tj: "дар",
  },

  Hi_x: {
    en: "Hi [X],",
    de: "Hallo [X],",
    ru: "Привет [X],",
    tj: "Салом [X],",
  },
  has_invited_you_organization: {
    en: "has invited you to the",
    de: "hat Sie eingeladen in die",
    ru: "пригласил вас в",
    tj: "шуморо ба",
  },
  has_invited_you_team: {
    en: "has invited you to the",
    de: "hat Sie eingeladen in das",
    ru: "пригласил вас в",
    tj: "шуморо ба",
  },
  has_invited_you_default: {
    en: "has invited you to",
    de: "hat Sie eingeladen zu",
    ru: "пригласил вас в",
    tj: "шуморо ба",
  },
  organization_in: {
    en: "organization in",
    de: "Organisation in",
    ru: "организацию в",
    tj: "ташкилот дар",
  },
  team_in: {
    en: "team in",
    de: "Team in",
    ru: "команду в",
    tj: "даста дар",
  },
  default_in: {
    en: "in",
    de: "in",
    ru: "в",
    tj: "дар",
  },

  Join_organization: {
    en: "Join Organization",
    de: "Organisation beitreten",
    ru: "Присоединиться к организации",
    tj: "Ба ташкилот ҳамроҳ шавед",
  },
  Join_team: {
    en: "Join Team",
    de: "Team beitreten",
    ru: "Присоединиться к команде",
    tj: "Ба даст ҳамроҳ шавед",
  },
  Join_default: {
    en: "Join",
    de: "Beitreten",
    ru: "Присоединиться",
    tj: "Ҳамроҳ шудан",
  },
} as const

export function t4invitation(entity?: string) {
  const isTeam = entity === "team"
  const isUndetermined = entity === undefined
  return {
    Join_x2: invitationT.Join_x2,
    Join_x2_p1: invitationT.Join_x2_p1,
    Join_x2_p2: invitationT.Join_x2_p2,
    Hi_x: invitationT.Hi_x,
    has_invited_you: isUndetermined
      ? invitationT.has_invited_you_default
      : isTeam
        ? invitationT.has_invited_you_team
        : invitationT.has_invited_you_organization,
    entity_in: isUndetermined ? invitationT.default_in : isTeam ? invitationT.team_in : invitationT.organization_in,
    Join_entity: isUndetermined
      ? invitationT.Join_default
      : isTeam
        ? invitationT.Join_team
        : invitationT.Join_organization,
  }
}

export type InvitationTranslations = ReturnType<typeof t4invitation>
