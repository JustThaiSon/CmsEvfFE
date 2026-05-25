import { JOB_LANG_CODES, JOB_TRANSLATION_FIELDS } from "@/constants/job";
import type { TranslationItem } from "@/types/job";

export type JobTranslationFormValues = Record<
  (typeof JOB_TRANSLATION_FIELDS)[number],
  Record<(typeof JOB_LANG_CODES)[number], string>
>;

export function createEmptyTranslationForm(): JobTranslationFormValues {
  return JOB_TRANSLATION_FIELDS.reduce((acc, field) => {
    acc[field] = { vi: "", en: "" };
    return acc;
  }, {} as JobTranslationFormValues);
}

export function translationsToForm(translations: TranslationItem[]): JobTranslationFormValues {
  const form = createEmptyTranslationForm();

  for (const item of translations) {
    const field = item.fieldName as keyof JobTranslationFormValues;
    const lang = item.langCode as (typeof JOB_LANG_CODES)[number];
    if (field in form && (lang === "vi" || lang === "en")) {
      form[field][lang] = item.value ?? "";
    }
  }

  return form;
}

export function formToTranslations(form: JobTranslationFormValues): TranslationItem[] {
  const items: TranslationItem[] = [];

  for (const field of JOB_TRANSLATION_FIELDS) {
    for (const lang of JOB_LANG_CODES) {
      const value = form[field][lang]?.trim();
      if (value) {
        items.push({ fieldName: field, langCode: lang, value });
      }
    }
  }

  return items;
}
