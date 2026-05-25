import type { GetCategoryDetailRes, GetListCategoryRes } from "@/types/category";

export function mapListCategoryRes(item: unknown): GetListCategoryRes {
  const r = (item ?? {}) as Record<string, unknown>;
  return {
    id: String(r.id ?? r.Id ?? ""),
    categoryName: String(r.categoryName ?? r.CategoryName ?? ""),
  };
}

export function mapCategoryDetailRes(item: unknown): GetCategoryDetailRes {
  const r = (item ?? {}) as Record<string, unknown>;
  return {
    id: String(r.id ?? r.Id ?? ""),
    categoryName: String(r.categoryName ?? r.CategoryName ?? ""),
  };
}
