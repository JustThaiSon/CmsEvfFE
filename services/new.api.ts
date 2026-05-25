import type { CommonResponse } from "@/types/api";
import type {
  CreateNewReq,
  DeleteNewReq,
  GetListNewCmsPaggingRes,
  GetListNewCmsParams,
  GetNewDetailCmsRes,
  TranslationItem,
} from "@/types/new";
import { api } from "./api";

function toApiTranslations(translations: TranslationItem[]) {
  return translations.map((t) => ({
    FieldName: t.fieldName,
    LangCode: t.langCode,
    Value: t.value,
  }));
}

function toApiCreateBody(req: CreateNewReq) {
  return {
    Id: req.id,
    ThumpUrl: req.thumpUrl,
    Status: req.status,
    IsFeatured: req.isFeatured,
    CategoryId: req.categoryId,
    Translations: toApiTranslations(req.translations),
  };
}

export async function getListNewCms(params: GetListNewCmsParams = {}) {
  const { lang = "vi", pageNumber = 1, pageSize = 10 } = params;
  const { data } = await api.get<CommonResponse<GetListNewCmsPaggingRes>>(
    "/api/New/GetListNewCms",
    { params: { lang, pageNumber, pageSize } }
  );
  return data;
}

export async function getNewDetail(newId: string, lang = "vi") {
  const { data } = await api.get<CommonResponse<GetNewDetailCmsRes>>(
    "/api/New/GetNewDetail",
    { params: { newId, lang } }
  );
  return data;
}

export async function createNew(req: CreateNewReq) {
  const { data } = await api.post<CommonResponse<boolean>>(
    "/api/New/CreateNew",
    toApiCreateBody(req)
  );
  return data;
}

export async function updateNew(req: CreateNewReq) {
  const { data } = await api.post<CommonResponse<boolean>>(
    "/api/New/UpdateNew",
    toApiCreateBody(req)
  );
  return data;
}

export async function deleteNew(req: DeleteNewReq) {
  const { data } = await api.post<CommonResponse<boolean>>("/api/New/DeleteNew", {
    Id: req.id,
  });
  return data;
}
