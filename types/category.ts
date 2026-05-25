export interface CategoryTranslationItem {
  fieldName: string;
  langCode: string;
  value: string;
}

export interface GetListCategoryRes {
  id: string;
  categoryName: string;
}

export interface GetCategoryDetailRes {
  id: string;
  categoryName: string;
}

export interface CreateCategoryReq {
  translations: CategoryTranslationItem[];
}

export interface UpdateCategoryReq {
  id: string;
  translations: CategoryTranslationItem[];
}

export interface DeleteCategoryReq {
  id: string;
}
