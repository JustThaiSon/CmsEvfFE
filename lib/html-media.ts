import { RESPONSE_CODE } from "@/constants/auth";
import { deleteUploadedFile } from "@/lib/uploaded-file";
import { uploadMedia } from "@/services/media.api";
import { api } from "@/services/api";

export const HTML_MEDIA_FOLDER = "job-html";

export function isMediaPath(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return true;
  }
  return /\.html?$/i.test(trimmed);
}

/** DB có thể lưu thiếu prefix — chuẩn hóa trước khi fetch/upload */
export function normalizeMediaPath(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return trimmed;
    }
  }

  if (trimmed.startsWith("/uploads/")) {
    return trimmed;
  }

  if (trimmed.startsWith("uploads/")) {
    return `/${trimmed}`;
  }

  const fileName = trimmed.replace(/^\/+/, "");
  if (/\.html?$/i.test(fileName)) {
    return `/uploads/${HTML_MEDIA_FOLDER}/${fileName}`;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function extractBodyHtml(html: string): string {
  if (!html.trim()) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const body = doc.body?.innerHTML?.trim();
    return body || html;
  } catch {
    return html;
  }
}

/** Xóa file HTML cũ trên server (không chặn luồng lưu nếu file đã mất) */
export async function deleteHtmlFile(pathOrUrl?: string | null): Promise<void> {
  const path = normalizeMediaPath(pathOrUrl);
  if (!path || !/\.html?$/i.test(path)) {
    return;
  }
  await deleteUploadedFile(path);
}

export async function fetchHtmlContent(pathOrUrl: string): Promise<string> {
  const path = normalizeMediaPath(pathOrUrl);
  if (!path) return "";

  try {
    const { data } = await api.get(path, { responseType: "text" });
    return extractBodyHtml(typeof data === "string" ? data : String(data ?? ""));
  } catch {
    if (typeof window !== "undefined") {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Không tải được file HTML (${res.status}): ${path}`);
      }
      return extractBodyHtml(await res.text());
    }
    throw new Error(`Không tải được file HTML: ${path}`);
  }
}

export async function uploadHtmlContent(
  html: string,
  folder: string,
  baseName: string,
  /** Đường dẫn file cũ trong DB — xóa trước khi upload bản mới */
  replacePath?: string | null
): Promise<string | null> {
  const trimmed = html.trim();
  if (!trimmed) return null;

  if (replacePath) {
    await deleteHtmlFile(replacePath);
  }

  const documentHtml = trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")
    ? trimmed
    : `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${trimmed}</body></html>`;

  const file = new File([documentHtml], `${baseName}.html`, { type: "text/html" });
  const res = await uploadMedia(file, folder);

  if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
    return normalizeMediaPath(res.data);
  }

  throw new Error(res.message || "Upload HTML failed");
}
