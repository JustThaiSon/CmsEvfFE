import type { CommonResponse } from "@/types/api";
import { api } from "./api";

/** ASP.NET [FromBody] string — body phải là JSON string */
export async function deleteMedia(filePath: string) {
  const { data } = await api.post<CommonResponse<boolean>>(
    "/api/Media/Delete",
    JSON.stringify(filePath),
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
}

export async function uploadMedia(file: File, folder = "images") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const { data } = await api.post<CommonResponse<string>>("/api/Media/Upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
