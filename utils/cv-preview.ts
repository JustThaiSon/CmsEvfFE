/** URL xem file qua Next rewrite (cùng origin), tránh mở download trực tiếp API */
export function cvViewPath(cvUrl: string): string {
  if (!cvUrl?.trim()) return "";

  const trimmed = cvUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return trimmed;
    }
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export type CvPreviewKind = "pdf" | "image" | "unsupported";

export function getCvPreviewKind(cvUrl: string): CvPreviewKind {
  const path = cvViewPath(cvUrl).split("?")[0] ?? "";
  const ext = path.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  return "unsupported";
}
