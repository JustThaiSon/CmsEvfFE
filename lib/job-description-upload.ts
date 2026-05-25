import { JOB_LANG_CODES } from "@/constants/job";
import {
  HTML_MEDIA_FOLDER,
  deleteHtmlFile,
  normalizeMediaPath,
  uploadHtmlContent,
} from "@/lib/html-media";
import type { JobTranslationFormValues } from "@/lib/job-translations";

export type DescriptionHtmlDrafts = Partial<
  Record<(typeof JOB_LANG_CODES)[number], string>
>;

function isEmptyEditorHtml(html: string): boolean {
  const trimmed = html.trim();
  if (!trimmed) return true;
  const plain = trimmed
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return !plain;
}

export type UploadDescriptionsResult = {
  form: JobTranslationFormValues;
  /** File HTML mới upload trong lần Lưu — rollback nếu API lỗi */
  uploadedPaths: string[];
};

export async function uploadJobDescriptions(
  translations: JobTranslationFormValues,
  htmlDrafts: DescriptionHtmlDrafts,
  filePrefix: string
): Promise<UploadDescriptionsResult> {
  const next: JobTranslationFormValues = {
    ...translations,
    Description: { ...translations.Description },
  };
  const uploadedPaths: string[] = [];

  for (const lang of JOB_LANG_CODES) {
    const existing = normalizeMediaPath(translations.Description[lang]);
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
      HTML_MEDIA_FOLDER,
      `${filePrefix}-${lang}`,
      existing
    );
    if (!path) {
      throw new Error(`Failed to upload description HTML (${lang})`);
    }
    const normalized = normalizeMediaPath(path);
    next.Description[lang] = normalized;
    if (normalized && normalized !== existing) {
      uploadedPaths.push(normalized);
    }
  }

  return { form: next, uploadedPaths };
}
