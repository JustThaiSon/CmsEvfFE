import type { CommonResponse } from "@/types/api";
import type {
  CreateCategoryReq,
  DeleteCategoryReq,
  GetCategoryDetailRes,
  GetListCategoryRes,
  UpdateCategoryReq,
} from "@/types/category";
import { api } from "./api";

function toApiTranslations(translations: CreateCategoryReq["translations"]) {
  return translations.map((t) => ({
    FieldName: t.fieldName,
    LangCode: t.langCode,
    Value: t.value,
  }));
}

export async function getListCategory(lang = "vi") {
  const { data } = await api.get<CommonResponse<GetListCategoryRes[]>>(
    "/api/Category/GetListCategory",
    { params: { lang } }
  );
  return data;
}

export async function getCategoryDetail(id: string, lang = "vi") {
  const { data } = await api.get<CommonResponse<GetCategoryDetailRes>>(
    "/api/Category/GetCategoryDetail",
    { params: { id, lang } }
  );
  return data;
}

export async function createCategory(req: CreateCategoryReq) {
  const { data } = await api.post<CommonResponse<boolean>>("/api/Category", {
    Translations: toApiTranslations(req.translations),
  });
  return data;
}

export async function updateCategory(req: UpdateCategoryReq) {
  const { data } = await api.post<CommonResponse<boolean>>("/api/Category/UpdateCategory", {
    Id: req.id,
    Translations: toApiTranslations(req.translations),
  });
  return data;
}

export async function deleteCategory(req: DeleteCategoryReq) {
  const { data } = await api.post<CommonResponse<boolean>>("/api/Category/DeleteCategory", {
    Id: req.id,
  });
  return data;
}
