import type { PaginationRes } from "./pagination";

export interface ContactRequestRes {
  id: string;
  fullName: string;
  phone?: string | null;
  email: string;
  message?: string | null;
  isAgreed: boolean;
  createdDate: string;
}

export type ContactRequestListRes = PaginationRes<ContactRequestRes>;

export interface GetContactRequestParams {
  page?: number;
  pageSize?: number;
  lang?: string;
}

export interface GetContactRequestDetailParams {
  id: string;
  lang?: string;
}
