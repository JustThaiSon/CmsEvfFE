import type { PaginationRes } from "@/types/pagination";

/** Hỗ trợ PascalCase / camelCase từ .NET API */
export function normalizePagination<T>(data: unknown): PaginationRes<T> {
  if (!data || typeof data !== "object") {
    return { totalRecord: 0, records: [] };
  }

  const raw = data as Record<string, unknown>;
  const totalRecord = Number(raw.totalRecord ?? raw.TotalRecord ?? 0);
  const records = (raw.records ?? raw.Records ?? []) as T[];

  return {
    totalRecord: Number.isFinite(totalRecord) ? totalRecord : 0,
    records: Array.isArray(records) ? records : [],
  };
}
