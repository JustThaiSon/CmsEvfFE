export const NEW_TRANSLATION_FIELDS = ["Title", "Description"] as const;

export type NewTranslationField = (typeof NEW_TRANSLATION_FIELDS)[number];

export const NEW_LANG_CODES = ["vi", "en"] as const;

export const NEW_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const;

export const NEW_FEATURED = {
  NO: 0,
  YES: 1,
} as const;

export const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
