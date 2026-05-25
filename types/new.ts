import type { PaginationRes } from "./pagination";

export interface TranslationItem {
  fieldName: string;
  langCode: string;
  value: string;
}

export interface GetListNewCmsRes {
  id: string;
  title: string;
  thumpUrl: string;
  status: number;
  isFeatured: number;
  createdAt: string;
}

export type GetListNewCmsPaggingRes = PaginationRes<GetListNewCmsRes>;

export interface GetNewDetailCmsRes {
  id: string;
  title: string;
  description: string;
  thumpUrl: string;
  status: number;
  isFeatured: number;
  categoryId: string;
  createdAt: string;
}

export interface CreateNewReq {
  id: string;
  thumpUrl: string;
  status: number;
  isFeatured: number;
  categoryId: string;
  translations: TranslationItem[];
}

export interface DeleteNewReq {
  id: string;
}

export interface GetListNewCmsParams {
  lang?: string;
  pageNumber?: number;
  pageSize?: number;
}
