import type { CommonResponse } from "@/types/api";
import type { CandidateListRes, GetListCandidateParams } from "@/types/candidate";
import { api } from "./api";

export async function getListCandidate(params: GetListCandidateParams) {
  const { jdId, pageNumber = 1, pageSize = 10 } = params;
  const { data } = await api.get<CommonResponse<CandidateListRes>>(
    "/api/Candidate/GetListCandidate",
    { params: { jdId, pageNumber, pageSize } }
  );
  return data;
}
