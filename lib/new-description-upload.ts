import { NEW_LANG_CODES } from "@/constants/new";
import {
  deleteHtmlFile,
  normalizeMediaPath,
  uploadHtmlContent,
} from "@/lib/html-media";
import type { NewTranslationFormValues } from "@/lib/new-translations";

export const NEW_HTML_MEDIA_FOLDER = "new-html";

export type NewDescriptionHtmlDrafts = Partial<
  Record<(typeof NEW_LANG_CODES)[number], string>
>;

export function normalizeNewHtmlPath(value?: string | null): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("/uploads/")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const pathname = new URL(trimmed).pathname;
      if (pathname.startsWith("/uploads/")) return pathname;
    } catch {
      return trimmed;
    }
  }
  const fileName = trimmed.replace(/^\/+/, "");
  if (/\.html?$/i.test(fileName)) {
    return `/uploads/${NEW_HTML_MEDIA_FOLDER}/${fileName}`;
  }
  return normalizeMediaPath(trimmed);
}

function isEmptyEditorHtml(html: string): boolean {
  const trimmed = html.trim();
  if (!trimmed) return true;
  const plain = trimmed
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return !plain;
}

export type UploadNewDescriptionsResult = {
  form: NewTranslationFormValues;
  uploadedPaths: string[];
};

export async function uploadNewDescriptions(
  translations: NewTranslationFormValues,
  htmlDrafts: NewDescriptionHtmlDrafts,
  filePrefix: string
): Promise<UploadNewDescriptionsResult> {
  const next: NewTranslationFormValues = {
    ...translations,
    Description: { ...translations.Description },
  };
  const uploadedPaths: string[] = [];

  for (const lang of NEW_LANG_CODES) {
    const existing = normalizeNewHtmlPath(translations.Description[lang]);
    const content = htmlDrafts[lang]?.trim() ?? "";

    if (isEmptyEditorHtml(content)) {
      if (existing) {
        await deleteHtmlFile(existing);
      }
      next.Description[lang] = "";
      continue;
    }

    const path = await uploadHtmlContent(
      content,
      NEW_HTML_MEDIA_FOLDER,
      `${filePrefix}-${lang}`,
      existing
    );
    if (!path) {
      throw new Error(`Failed to upload description HTML (${lang})`);
    }
    const normalized = normalizeNewHtmlPath(path);
    next.Description[lang] = normalized;
    if (normalized && normalized !== existing) {
      uploadedPaths.push(normalized);
    }
  }

  return { form: next, uploadedPaths };
}
