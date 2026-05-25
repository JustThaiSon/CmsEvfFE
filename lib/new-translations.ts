import { NEW_LANG_CODES, NEW_TRANSLATION_FIELDS } from "@/constants/new";
import type { TranslationItem } from "@/types/new";

export type NewTranslationFormValues = Record<
  (typeof NEW_TRANSLATION_FIELDS)[number],
  Record<(typeof NEW_LANG_CODES)[number], string>
>;

export function createEmptyNewTranslationForm(): NewTranslationFormValues {
  return NEW_TRANSLATION_FIELDS.reduce((acc, field) => {
    acc[field] = { vi: "", en: "" };
    return acc;
  }, {} as NewTranslationFormValues);
}

export function formToNewTranslations(form: NewTranslationFormValues): TranslationItem[] {
  const items: TranslationItem[] = [];

  for (const field of NEW_TRANSLATION_FIELDS) {
    for (const lang of NEW_LANG_CODES) {
      const value = form[field][lang]?.trim();
      if (value) {
        items.push({ fieldName: field, langCode: lang, value });
      }
    }
  }

  return items;
}
