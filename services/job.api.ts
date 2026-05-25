import type { CommonResponse } from "@/types/api";
import type {
  CreateJobReq,
  DeleteJobReq,
  GetListJobCmsPaggingRes,
  GetListJobCmsParams,
  JobDetailForUpdateRes,
  TranslationItem,
} from "@/types/job";
import { api } from "./api";

export async function getListJobCms(params: GetListJobCmsParams = {}) {
  const { data } = await api.get<CommonResponse<GetListJobCmsPaggingRes>>(
    "/api/Job/GetListJob",
    { params }
  );
  return data;
}

export async function getJobDetail(jobId: string) {
  const { data } = await api.get<CommonResponse<JobDetailForUpdateRes>>(
    "/api/Job/GetDetail",
    { params: { jobId } }
  );
  return data;
}

export async function createJob(req: CreateJobReq) {
  const { data } = await api.post<CommonResponse<string>>("/api/Job/CreateJob", req);
  return data;
}

export async function updateJobTranslation(jobId: string, translations: TranslationItem[]) {
  const body = translations.map((t) => ({
    FieldName: t.fieldName,
    LangCode: t.langCode,
    Value: t.value,
  }));

  const { data } = await api.post<CommonResponse<boolean>>(
    `/api/Job/UpdateJob?jobId=${encodeURIComponent(jobId)}`,
    body
  );
  return data;
}

export async function deleteJob(req: DeleteJobReq) {
  const { data } = await api.post<CommonResponse<boolean>>("/api/Job/DeleteJob", req);
  return data;
}
