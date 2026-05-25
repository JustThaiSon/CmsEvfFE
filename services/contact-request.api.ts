import type { CommonResponse } from "@/types/api";
import type {
  ContactRequestListRes,
  ContactRequestRes,
  GetContactRequestDetailParams,
  GetContactRequestParams,
} from "@/types/contact-request";
import { api } from "./api";

export async function getContactRequests(params: GetContactRequestParams = {}) {
  const { page = 1, pageSize = 10, lang = "vi" } = params;
  const { data } = await api.get<CommonResponse<ContactRequestListRes>>(
    "/api/ContactRequest/GetContactRequest",
    { params: { page, pageSize, lang } }
  );
  return data;
}

export async function getContactRequestDetail(params: GetContactRequestDetailParams) {
  const { id, lang = "vi" } = params;
  const { data } = await api.get<CommonResponse<ContactRequestRes>>(
    "/api/ContactRequest/GetContactRequestDetail",
    { params: { id, lang } }
  );
  return data;
}
