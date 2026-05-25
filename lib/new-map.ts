import type { GetListNewCmsRes, GetNewDetailCmsRes } from "@/types/new";

export function mapListNewCmsRes(item: unknown): GetListNewCmsRes {
  const r = (item ?? {}) as Record<string, unknown>;
  return {
    id: String(r.id ?? r.Id ?? ""),
    title: String(r.title ?? r.Title ?? ""),
    thumpUrl: String(r.thumpUrl ?? r.ThumpUrl ?? ""),
    status: Number(r.status ?? r.Status ?? 0),
    isFeatured: Number(r.isFeatured ?? r.IsFeatured ?? 0),
    createdAt: String(r.createdAt ?? r.CreatedAt ?? ""),
  };
}

export function mapNewDetailCmsRes(item: unknown): GetNewDetailCmsRes {
  const r = (item ?? {}) as Record<string, unknown>;
  return {
    id: String(r.id ?? r.Id ?? ""),
    title: String(r.title ?? r.Title ?? ""),
    description: String(r.description ?? r.Description ?? ""),
    thumpUrl: String(r.thumpUrl ?? r.ThumpUrl ?? ""),
    status: Number(r.status ?? r.Status ?? 0),
    isFeatured: Number(r.isFeatured ?? r.IsFeatured ?? 0),
    categoryId: String(r.categoryId ?? r.CategoryId ?? ""),
    createdAt: String(r.createdAt ?? r.CreatedAt ?? ""),
  };
}
