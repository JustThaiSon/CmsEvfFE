import { RESPONSE_CODE } from "@/constants/auth";
import { deleteMedia } from "@/services/media.api";

/** Chuẩn hóa path/URL trả về từ Media/Upload */
export function normalizeUploadedPath(value?: string | null): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return trimmed;
    }
  }

  if (trimmed.startsWith("uploads/")) {
    return `/${trimmed}`;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** Xóa file đã upload (ảnh, html, …) dưới /uploads/ */
export async function deleteUploadedFile(pathOrUrl?: string | null): Promise<void> {
  const path = normalizeUploadedPath(pathOrUrl);
  if (!path || !path.startsWith("/uploads/")) {
    return;
  }

  try {
    const res = await deleteMedia(path);
    if (
      res.responseCode !== RESPONSE_CODE.SUCCESS &&
      res.responseCode !== RESPONSE_CODE.NOT_FOUND
    ) {
      console.warn("deleteUploadedFile:", res.message ?? path);
    }
  } catch (err) {
    console.warn("deleteUploadedFile failed:", path, err);
  }
}

export async function deleteUploadedFiles(paths: Iterable<string | null | undefined>): Promise<void> {
  const unique = new Set<string>();
  for (const p of paths) {
    const normalized = normalizeUploadedPath(p);
    if (normalized) unique.add(normalized);
  }
  await Promise.all([...unique].map((path) => deleteUploadedFile(path)));
}
