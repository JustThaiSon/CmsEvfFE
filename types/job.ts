import type { PaginationRes } from "./pagination";

export interface TranslationItem {
  fieldName: string;
  langCode: string;
  value: string;
}

export interface GetListJobCmsRes {
  id: string;
  title: string;
  status: number;
  quantity: number;
  jobType: number;
  postedAt: string;
}

export type GetListJobCmsPaggingRes = PaginationRes<GetListJobCmsRes>;

export interface JobDetailForUpdateRes {
  id: string;
  status: number;
  quantity: number;
  jobType: number;
  postedAt: string;
  translations: TranslationItem[];
}

export interface CreateJobReq {
  status: number;
  quantity: number;
  jobType: number;
  postedAt: string;
  translations: TranslationItem[];
}

export interface DeleteJobReq {
  jobId: string;
}

export interface GetListJobCmsParams {
  lang?: string;
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}
