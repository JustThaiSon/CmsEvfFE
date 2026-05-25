import type { PaginationRes } from "./pagination";

export interface CandidateRes {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  address: string;
  message?: string | null;
  createdDate: string;
}

export type CandidateListRes = PaginationRes<CandidateRes>;

export interface GetListCandidateParams {
  jdId: string;
  pageNumber?: number;
  pageSize?: number;
}
