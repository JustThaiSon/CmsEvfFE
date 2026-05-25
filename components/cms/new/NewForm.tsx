"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
  Typography,
  Upload,
  message,
} from "antd";
import type { UploadProps } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import type { Locale } from "@/i18n/config";
import { CMS_ROUTES } from "@/constants";
import { isValidGuid } from "@/constants/guid";
import {
  EMPTY_GUID,
  NEW_FEATURED,
  NEW_LANG_CODES,
  NEW_STATUS,
  NEW_TRANSLATION_FIELDS,
} from "@/constants/new";
import { RESPONSE_CODE } from "@/constants/auth";
import HtmlEditor, {
  type HtmlEditorDict,
  type HtmlEditorHandle,
} from "@/components/cms/editor/HtmlEditor";
import {
  createEmptyNewTranslationForm,
  formToNewTranslations,
  type NewTranslationFormValues,
} from "@/lib/new-translations";
import { usePendingUploads } from "@/hooks/usePendingUploads";
import { isMediaPath } from "@/lib/html-media";
import {
  NEW_HTML_MEDIA_FOLDER,
  normalizeNewHtmlPath,
  type NewDescriptionHtmlDrafts,
  uploadNewDescriptions,
} from "@/lib/new-description-upload";
import { normalizeUploadedPath } from "@/lib/uploaded-file";
import { mapNewDetailCmsRes } from "@/lib/new-map";
import { getListCategory } from "@/services/category.api";
import { mapListCategoryRes } from "@/lib/category-map";
import { createNew, getNewDetail, updateNew } from "@/services/new.api";
import { uploadMedia } from "@/services/media.api";
import { localePath } from "@/utils/locale-path";
import { resolveMediaUrl } from "@/utils/media-url";

type NewFormDict = {
  createTitle: string;
  editTitle: string;
  back: string;
  save: string;
  createSuccess: string;
  updateSuccess: string;
  saveError: string;
  loadError: string;
  notFound: string;
  metadata: string;
  translations: string;
  status: string;
  isFeatured: string;
  categoryId: string;
  categoryIdRequired: string;
  categoryPlaceholder: string;
  categoryLoadError: string;
  manageCategories: string;
  thumbnail: string;
  thumbnailUpload: string;
  thumbnailUploadError: string;
  statusActive: string;
  statusInactive: string;
  featuredYes: string;
  featuredNo: string;
  fieldTitle: string;
  fieldDescription: string;
  langVi: string;
  langEn: string;
  translationsRequired: string;
  titleRequired: string;
  editor: HtmlEditorDict;
};

type NewFormProps = {
  lang: Locale;
  mode: "create" | "edit";
  newId?: string;
  dict: NewFormDict;
};

export default function NewForm({ lang, mode, newId, dict }: NewFormProps) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editorMountKey, setEditorMountKey] = useState(0);
  const [descriptionDrafts, setDescriptionDrafts] = useState<NewDescriptionHtmlDrafts>({
    vi: "",
    en: "",
  });
  const editorRefs = useRef<
    Partial<Record<(typeof NEW_LANG_CODES)[number], HtmlEditorHandle | null>>
  >({});
  const detailLoadedNewIdRef = useRef<string | null>(null);
  const createDescriptionPrefixRef = useRef(`new-${crypto.randomUUID().slice(0, 8)}`);

  const descriptionFilePrefix =
    mode === "edit" && newId ? `new-${newId}` : createDescriptionPrefixRef.current;

  const [savedMediaPaths, setSavedMediaPaths] = useState<ReadonlySet<string>>(new Set());
  const pendingUploads = usePendingUploads(savedMediaPaths);

  const applySavedPaths = useCallback(
    (thumpUrl: string, translations: NewTranslationFormValues) => {
      const paths = new Set<string>();
      const thumb = normalizeUploadedPath(thumpUrl);
      if (thumb) paths.add(thumb);
      for (const langCode of NEW_LANG_CODES) {
        const p = translations.Description[langCode];
        if (p && isMediaPath(p)) {
          paths.add(normalizeNewHtmlPath(p));
        }
      }
      setSavedMediaPaths(paths);
    },
    []
  );

  const postsPath = localePath(CMS_ROUTES.POSTS, lang);
  const categoriesPath = localePath(CMS_ROUTES.CATEGORIES, lang);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await getListCategory(lang);
      if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
        const list = (Array.isArray(res.data) ? res.data : []).map(mapListCategoryRes);
        setCategories(
          list
            .filter((c) => isValidGuid(c.id))
            .map((c) => ({ value: c.id, label: c.categoryName || c.id }))
        );
      } else {
        message.error(res.message || dict.categoryLoadError);
        setCategories([]);
      }
    } catch {
      message.error(dict.categoryLoadError);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [lang, dict.categoryLoadError]);

  const descriptionDraftHandlers = useMemo(
    () =>
      Object.fromEntries(
        NEW_LANG_CODES.map((langCode) => [
          langCode,
          (html: string) => {
            setDescriptionDrafts((prev) =>
              prev[langCode] === html ? prev : { ...prev, [langCode]: html }
            );
          },
        ])
      ) as Record<(typeof NEW_LANG_CODES)[number], (html: string) => void>,
    []
  );

  const remountDescriptionEditors = useCallback(() => {
    setDescriptionDrafts({ vi: "", en: "" });
    setEditorMountKey((k) => k + 1);
  }, []);

  const loadDetail = useCallback(async () => {
    if (mode !== "edit" || !newId) return;

    setLoading(true);
    try {
      const [viRes, enRes] = await Promise.all([
        getNewDetail(newId, "vi"),
        getNewDetail(newId, "en"),
      ]);

      if (
        viRes.responseCode === RESPONSE_CODE.SUCCESS &&
        viRes.data &&
        enRes.responseCode === RESPONSE_CODE.SUCCESS &&
        enRes.data
      ) {
        const vi = mapNewDetailCmsRes(viRes.data);
        const en = mapNewDetailCmsRes(enRes.data);
        const translations = createEmptyNewTranslationForm();
        translations.Title.vi = vi.title;
        translations.Title.en = en.title;
        translations.Description.vi = vi.description;
        translations.Description.en = en.description;

        form.setFieldsValue({
          thumpUrl: vi.thumpUrl,
          status: vi.status,
          isFeatured: vi.isFeatured,
          categoryId: vi.categoryId || en.categoryId,
          translations,
        });
        applySavedPaths(vi.thumpUrl, translations);
      } else {
        message.error(viRes.message || enRes.message || dict.notFound);
      }
    } catch {
      message.error(dict.loadError);
    } finally {
      setLoading(false);
    }
  }, [mode, newId, form, dict.loadError, dict.notFound, applySavedPaths]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (mode === "create") {
      detailLoadedNewIdRef.current = null;
      form.setFieldsValue({
        status: NEW_STATUS.ACTIVE,
        isFeatured: NEW_FEATURED.NO,
        thumpUrl: "",
        categoryId: "",
        translations: createEmptyNewTranslationForm(),
      });
      setSavedMediaPaths(new Set());
      return;
    }

    if (!newId || detailLoadedNewIdRef.current === newId) return;
    detailLoadedNewIdRef.current = newId;

    void (async () => {
      await loadDetail();
      remountDescriptionEditors();
    })();
  }, [mode, newId, form, loadDetail, remountDescriptionEditors]);

  const thumbUploadProps: UploadProps = {
    accept: "image/jpeg,image/png,image/gif,image/webp",
    showUploadList: false,
    beforeUpload: async (file) => {
      setThumbUploading(true);
      try {
        const previousThumb = form.getFieldValue("thumpUrl") as string | undefined;
        const res = await uploadMedia(file, "news");
        if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
          pendingUploads.trackUpload(res.data, { replaces: previousThumb });
          form.setFieldValue("thumpUrl", res.data);
          message.success(dict.thumbnailUpload);
        } else {
          message.error(res.message || dict.thumbnailUploadError);
        }
      } catch {
        message.error(dict.thumbnailUploadError);
      } finally {
        setThumbUploading(false);
      }
      return false;
    },
  };

  const onFinish = async (values: {
    thumpUrl: string;
    status: number;
    isFeatured: number;
    categoryId: string;
    translations: NewTranslationFormValues;
  }) => {
    const categoryId = values.categoryId?.trim();
    if (!categoryId || !isValidGuid(categoryId)) {
      message.warning(dict.categoryIdRequired);
      return;
    }

    if (!values.translations.Title.vi?.trim()) {
      message.warning(dict.titleRequired);
      return;
    }

    setSubmitting(true);
    let uploadedOnSave: string[] = [];

    try {
      const flushedDrafts: NewDescriptionHtmlDrafts = {};
      for (const langCode of NEW_LANG_CODES) {
        flushedDrafts[langCode] =
          editorRefs.current[langCode]?.getContent()?.trim() ??
          descriptionDrafts[langCode]?.trim() ??
          "";
      }

      const thumbPath = normalizeUploadedPath(values.thumpUrl);
      if (thumbPath && !savedMediaPaths.has(thumbPath)) {
        uploadedOnSave.push(thumbPath);
      }

      const { form: translationsWithPaths, uploadedPaths } = await uploadNewDescriptions(
        values.translations,
        flushedDrafts,
        descriptionFilePrefix
      );
      uploadedOnSave = [...uploadedOnSave, ...uploadedPaths];
      const translations = formToNewTranslations(translationsWithPaths);

      if (!translations.some((t) => t.fieldName === "Title")) {
        message.warning(dict.titleRequired);
        setSubmitting(false);
        return;
      }
      if (translations.length === 0) {
        message.warning(dict.translationsRequired);
        setSubmitting(false);
        return;
      }

      const payload = {
        id: mode === "edit" && newId ? newId : EMPTY_GUID,
        thumpUrl: values.thumpUrl?.trim() ?? "",
        status: values.status,
        isFeatured: values.isFeatured,
        categoryId,
        translations,
      };

      const res =
        mode === "create" ? await createNew(payload) : await updateNew(payload);

      if (res.responseCode === RESPONSE_CODE.SUCCESS) {
        pendingUploads.commit();
        message.success(
          res.message ||
            (mode === "create" ? dict.createSuccess : dict.updateSuccess)
        );
        if (mode === "edit") {
          await loadDetail();
          remountDescriptionEditors();
        } else {
          router.replace(postsPath);
        }
      } else {
        await pendingUploads.rollback(uploadedOnSave);
        message.error(res.message || dict.saveError);
      }
    } catch (error) {
      await pendingUploads.rollback(uploadedOnSave);
      const msg = error instanceof Error ? error.message : dict.saveError;
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const thumpUrl = Form.useWatch("thumpUrl", form);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[320px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <Space className="mb-6">
          <Link href={postsPath}>
            <Button icon={<ArrowLeftOutlined />}>{dict.back}</Button>
          </Link>
          <Typography.Title level={4} className="!mb-0">
            {mode === "create" ? dict.createTitle : dict.editTitle}
          </Typography.Title>
        </Space>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Typography.Title level={5}>{dict.metadata}</Typography.Title>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="status" label={dict.status} rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: NEW_STATUS.ACTIVE, label: dict.statusActive },
                    { value: NEW_STATUS.INACTIVE, label: dict.statusInactive },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="isFeatured"
                label={dict.isFeatured}
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: NEW_FEATURED.YES, label: dict.featuredYes },
                    { value: NEW_FEATURED.NO, label: dict.featuredNo },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="categoryId"
                label={dict.categoryId}
                rules={[{ required: true, message: dict.categoryIdRequired }]}
              >
                <Select
                  showSearch
                  allowClear
                  loading={categoriesLoading}
                  placeholder={dict.categoryPlaceholder}
                  optionFilterProp="label"
                  options={categories}
                  notFoundContent={
                    <Typography.Text type="secondary">
                      <Link href={categoriesPath}>{dict.manageCategories}</Link>
                    </Typography.Text>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="thumpUrl" label={dict.thumbnail}>
            <Space align="start" wrap>
              <Upload {...thumbUploadProps}>
                <Button icon={<UploadOutlined />} loading={thumbUploading}>
                  {dict.thumbnailUpload}
                </Button>
              </Upload>
              {thumpUrl ? (
                <a href={resolveMediaUrl(thumpUrl)} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveMediaUrl(thumpUrl)}
                    alt=""
                    className="h-20 w-20 object-cover rounded border"
                  />
                </a>
              ) : null}
            </Space>
          </Form.Item>

          <Typography.Title level={5} className="!mt-4">
            {dict.translations}
          </Typography.Title>

          <Tabs
            destroyOnHidden={false}
            items={NEW_LANG_CODES.map((langCode) => ({
              key: langCode,
              label: langCode === "vi" ? dict.langVi : dict.langEn,
              children: (
                <>
                  <Form.Item
                    name={["translations", "Title", langCode]}
                    label={dict.fieldTitle}
                    rules={
                      langCode === "vi"
                        ? [{ required: true, message: dict.titleRequired }]
                        : undefined
                    }
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={["translations", "Description", langCode]}
                    label={dict.fieldDescription}
                    className="!mt-2"
                  >
                    <HtmlEditor
                      key={`new-description-${langCode}-${editorMountKey}`}
                      ref={(instance) => {
                        editorRefs.current[langCode] = instance;
                      }}
                      onHtmlDraftChange={descriptionDraftHandlers[langCode]}
                      onPendingUpload={pendingUploads.trackUpload}
                      savedMediaPaths={[...savedMediaPaths]}
                      dict={dict.editor}
                      fileNamePrefix={`${descriptionFilePrefix}-${langCode}`}
                      htmlUploadFolder={NEW_HTML_MEDIA_FOLDER}
                    />
                  </Form.Item>
                </>
              ),
            }))}
          />

          <Form.Item className="!mb-0 !mt-4">
            <Button type="primary" htmlType="submit" loading={submitting}>
              {dict.save}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
