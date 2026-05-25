import type { CandidateRes } from "@/types/candidate";

/** Chuẩn hóa field PascalCase / camelCase từ API */
export function mapCandidateRes(item: unknown): CandidateRes {
  const r = (item ?? {}) as Record<string, unknown>;
  return {
    id: String(r.id ?? r.Id ?? ""),
    fullName: String(r.fullName ?? r.FullName ?? ""),
    email: String(r.email ?? r.Email ?? ""),
    phone: String(r.phone ?? r.Phone ?? ""),
    cvUrl: String(r.cvUrl ?? r.CvUrl ?? ""),
    address: String(r.address ?? r.Address ?? ""),
    message: (r.message ?? r.Message ?? null) as string | null | undefined,
    createdDate: String(r.createdDate ?? r.CreatedDate ?? ""),
  };
}
