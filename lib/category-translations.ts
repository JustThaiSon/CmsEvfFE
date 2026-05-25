import { CATEGORY_LANG_CODES, CATEGORY_TRANSLATION_FIELD } from "@/constants/category";
import type { CategoryTranslationItem } from "@/types/category";

export type CategoryNameFormValues = Record<
  (typeof CATEGORY_LANG_CODES)[number],
  string
>;

export function createEmptyCategoryNameForm(): CategoryNameFormValues {
  return { vi: "", en: "" };
}

export function formToCategoryTranslations(
  names: CategoryNameFormValues
): CategoryTranslationItem[] {
  const items: CategoryTranslationItem[] = [];

  for (const lang of CATEGORY_LANG_CODES) {
    const value = names[lang]?.trim();
    if (value) {
      items.push({
        fieldName: CATEGORY_TRANSLATION_FIELD,
        langCode: lang,
        value,
      });
    }
  }

  return items;
}
