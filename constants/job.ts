export const JOB_TRANSLATION_FIELDS = [
  "Title",
  "Location",
  "Salary",
  "Description",
  "Level",
] as const;

export type JobTranslationField = (typeof JOB_TRANSLATION_FIELDS)[number];

export const JOB_LANG_CODES = ["vi", "en"] as const;

export const JOB_TYPE = {
  FULL_TIME: 1,
  PART_TIME: 2,
  CONTRACT: 3,
  INTERNSHIP: 4,
} as const;

export const JOB_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const;
