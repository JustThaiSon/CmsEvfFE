"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Col, Form, Input, Row, Space, Spin, Tabs, Typography, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { Locale } from "@/i18n/config";
import { CMS_ROUTES } from "@/constants";
import { CATEGORY_LANG_CODES } from "@/constants/category";
import { RESPONSE_CODE } from "@/constants/auth";
import {
  createEmptyCategoryNameForm,
  formToCategoryTranslations,
  type CategoryNameFormValues,
} from "@/lib/category-translations";
import { mapCategoryDetailRes } from "@/lib/category-map";
import { createCategory, getCategoryDetail, updateCategory } from "@/services/category.api";
import { localePath } from "@/utils/locale-path";

type CategoryFormDict = {
  createTitle: string;
  editTitle: string;
  back: string;
  save: string;
  createSuccess: string;
  updateSuccess: string;
  saveError: string;
  loadError: string;
  notFound: string;
  translations: string;
  fieldName: string;
  langVi: string;
  langEn: string;
  nameRequired: string;
};

type CategoryFormProps = {
  lang: Locale;
  mode: "create" | "edit";
  categoryId?: string;
  dict: CategoryFormDict;
};

export default function CategoryForm({ lang, mode, categoryId, dict }: CategoryFormProps) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);

  const categoriesPath = localePath(CMS_ROUTES.CATEGORIES, lang);

  const loadDetail = useCallback(async () => {
    if (mode !== "edit" || !categoryId) return;

    setLoading(true);
    try {
      const [viRes, enRes] = await Promise.all([
        getCategoryDetail(categoryId, "vi"),
        getCategoryDetail(categoryId, "en"),
      ]);

      if (
        viRes.responseCode === RESPONSE_CODE.SUCCESS &&
        viRes.data &&
        enRes.responseCode === RESPONSE_CODE.SUCCESS &&
        enRes.data
      ) {
        const vi = mapCategoryDetailRes(viRes.data);
        const en = mapCategoryDetailRes(enRes.data);
        form.setFieldsValue({
          names: {
            vi: vi.categoryName,
            en: en.categoryName,
          } satisfies CategoryNameFormValues,
        });
      } else {
        message.error(viRes.message || enRes.message || dict.notFound);
      }
    } catch {
      message.error(dict.loadError);
    } finally {
      setLoading(false);
    }
  }, [mode, categoryId, form, dict.loadError, dict.notFound]);

  useEffect(() => {
    if (mode === "create") {
      form.setFieldsValue({ names: createEmptyCategoryNameForm() });
    } else {
      loadDetail();
    }
  }, [mode, form, loadDetail]);

  const onFinish = async (values: { names: CategoryNameFormValues }) => {
    if (!values.names.vi?.trim()) {
      message.warning(dict.nameRequired);
      return;
    }

    const translations = formToCategoryTranslations(values.names);
    if (translations.length === 0) {
      message.warning(dict.nameRequired);
      return;
    }

    setSubmitting(true);
    try {
      const res =
        mode === "create"
          ? await createCategory({ translations })
          : await updateCategory({ id: categoryId!, translations });

      if (res.responseCode === RESPONSE_CODE.SUCCESS) {
        message.success(
          res.message ||
            (mode === "create" ? dict.createSuccess : dict.updateSuccess)
        );
        router.replace(categoriesPath);
      } else {
        message.error(res.message || dict.saveError);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : dict.saveError;
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
          <Link href={categoriesPath}>
            <Button icon={<ArrowLeftOutlined />}>{dict.back}</Button>
          </Link>
          <Typography.Title level={4} className="!mb-0">
            {mode === "create" ? dict.createTitle : dict.editTitle}
          </Typography.Title>
        </Space>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Typography.Title level={5}>{dict.translations}</Typography.Title>

          <Tabs
            items={CATEGORY_LANG_CODES.map((langCode) => ({
              key: langCode,
              label: langCode === "vi" ? dict.langVi : dict.langEn,
              children: (
                <Row>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name={["names", langCode]}
                      label={dict.fieldName}
                      rules={
                        langCode === "vi"
                          ? [{ required: true, message: dict.nameRequired }]
                          : undefined
                      }
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
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
