"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Locale } from "@/i18n/config";
import { CMS_ROUTES } from "@/constants";
import {
  JOB_LANG_CODES,
  JOB_STATUS,
  JOB_TRANSLATION_FIELDS,
  JOB_TYPE,
} from "@/constants/job";
import { RESPONSE_CODE } from "@/constants/auth";
import { localePath } from "@/utils/locale-path";
import {
  createEmptyTranslationForm,
  formToTranslations,
  translationsToForm,
} from "@/lib/job-translations";
import HtmlEditor, {
  type HtmlEditorDict,
  type HtmlEditorHandle,
} from "@/components/cms/editor/HtmlEditor";
import { usePendingUploads } from "@/hooks/usePendingUploads";
import { isMediaPath, normalizeMediaPath } from "@/lib/html-media";
import {
  type DescriptionHtmlDrafts,
  uploadJobDescriptions,
} from "@/lib/job-description-upload";
import type { JobTranslationFormValues } from "@/lib/job-translations";
import { createJob, getJobDetail, updateJobTranslation } from "@/services/job.api";

type JobFormDict = {
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
  quantity: string;
  jobType: string;
  postedAt: string;
  statusActive: string;
  statusInactive: string;
  jobTypeFullTime: string;
  jobTypePartTime: string;
  jobTypeContract: string;
  jobTypeInternship: string;
  editMetadataHint: string;
  fieldTitle: string;
  fieldLocation: string;
  fieldSalary: string;
  fieldDescription: string;
  fieldLevel: string;
  langVi: string;
  langEn: string;
  translationsRequired: string;
  editor: HtmlEditorDict;
};

type JobFormProps = {
  lang: Locale;
  mode: "create" | "edit";
  jobId?: string;
  dict: JobFormDict;
};

const fieldLabelMap: Record<(typeof JOB_TRANSLATION_FIELDS)[number], keyof JobFormDict> = {
  Title: "fieldTitle",
  Location: "fieldLocation",
  Salary: "fieldSalary",
  Description: "fieldDescription",
  Level: "fieldLevel",
};

export default function JobForm({ lang, mode, jobId, dict }: JobFormProps) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [editorMountKey, setEditorMountKey] = useState(0);
  const [descriptionDrafts, setDescriptionDrafts] = useState<DescriptionHtmlDrafts>({
    vi: "",
    en: "",
  });
  const editorRefs = useRef<
    Partial<Record<(typeof JOB_LANG_CODES)[number], HtmlEditorHandle | null>>
  >({});
  const detailLoadedJobIdRef = useRef<string | null>(null);
  const createDescriptionPrefixRef = useRef(`job-new-${crypto.randomUUID().slice(0, 8)}`);

  const descriptionFilePrefix =
    mode === "edit" && jobId ? `job-${jobId}` : createDescriptionPrefixRef.current;

  const [savedMediaPaths, setSavedMediaPaths] = useState<ReadonlySet<string>>(new Set());
  const pendingUploads = usePendingUploads(savedMediaPaths);

  const applySavedPathsFromTranslations = useCallback(
    (translations: JobTranslationFormValues) => {
      const paths = new Set<string>();
      for (const langCode of JOB_LANG_CODES) {
        const p = translations.Description[langCode];
        if (p && isMediaPath(p)) {
          paths.add(normalizeMediaPath(p));
        }
      }
      setSavedMediaPaths(paths);
    },
    []
  );

  const descriptionDraftHandlers = useMemo(
    () =>
      Object.fromEntries(
        JOB_LANG_CODES.map((langCode) => [
          langCode,
          (html: string) => {
            setDescriptionDrafts((prev) =>
              prev[langCode] === html ? prev : { ...prev, [langCode]: html }
            );
          },
        ])
      ) as Record<(typeof JOB_LANG_CODES)[number], (html: string) => void>,
    []
  );

  const jobsPath = localePath(CMS_ROUTES.JOBS, lang);

  const jobTypeOptions = [
    { value: JOB_TYPE.FULL_TIME, label: dict.jobTypeFullTime },
    { value: JOB_TYPE.PART_TIME, label: dict.jobTypePartTime },
    { value: JOB_TYPE.CONTRACT, label: dict.jobTypeContract },
    { value: JOB_TYPE.INTERNSHIP, label: dict.jobTypeInternship },
  ];

  const loadDetail = useCallback(async () => {
    if (mode !== "edit" || !jobId) return;

    setLoading(true);
    try {
      const res = await getJobDetail(jobId);

      if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
        const detail = res.data;
        const translations = translationsToForm(detail.translations ?? []);
        form.setFieldsValue({
          status: detail.status,
          quantity: detail.quantity,
          jobType: detail.jobType,
          postedAt: dayjs(detail.postedAt),
          translations,
        });
        applySavedPathsFromTranslations(translations);
      } else {
        message.error(res.message || dict.notFound);
      }
    } catch {
      message.error(dict.loadError);
    } finally {
      setLoading(false);
    }
  }, [mode, jobId, form, dict.loadError, dict.notFound, applySavedPathsFromTranslations]);

  const remountDescriptionEditors = useCallback(() => {
    setDescriptionDrafts({ vi: "", en: "" });
    setEditorMountKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (mode !== "create") return;

    detailLoadedJobIdRef.current = null;
    form.setFieldsValue({
      status: JOB_STATUS.ACTIVE,
      quantity: 1,
      jobType: JOB_TYPE.FULL_TIME,
      postedAt: dayjs(),
      translations: createEmptyTranslationForm(),
    });
    setSavedMediaPaths(new Set());
  }, [mode, form]);

  useEffect(() => {
    if (mode !== "edit" || !jobId) return;
    if (detailLoadedJobIdRef.current === jobId) return;

    detailLoadedJobIdRef.current = jobId;

    void (async () => {
      await loadDetail();
      remountDescriptionEditors();
    })();
  }, [mode, jobId, loadDetail, remountDescriptionEditors]);

  const onFinish = async (values: {
    status: number;
    quantity: number;
    jobType: number;
    postedAt: dayjs.Dayjs;
    translations: ReturnType<typeof createEmptyTranslationForm>;
  }) => {
    setSubmitting(true);
    let uploadedOnSave: string[] = [];

    try {
      const flushedDrafts: DescriptionHtmlDrafts = {};
      for (const langCode of JOB_LANG_CODES) {
        flushedDrafts[langCode] =
          editorRefs.current[langCode]?.getContent()?.trim() ??
          descriptionDrafts[langCode]?.trim() ??
          "";
      }

      const { form: translationsWithPaths, uploadedPaths } = await uploadJobDescriptions(
        values.translations,
        flushedDrafts,
        descriptionFilePrefix
      );
      uploadedOnSave = uploadedPaths;
      const translations = formToTranslations(translationsWithPaths);

      if (translations.length === 0) {
        message.warning(dict.translationsRequired);
        setSubmitting(false);
        return;
      }

      if (mode === "create") {
        const res = await createJob({
          status: values.status,
          quantity: values.quantity,
          jobType: values.jobType,
          postedAt: values.postedAt.toISOString(),
          translations,
        });

        if (res.responseCode === RESPONSE_CODE.SUCCESS) {
          pendingUploads.commit();
          message.success(res.message || dict.createSuccess);
          router.replace(jobsPath);
        } else {
          await pendingUploads.rollback(uploadedOnSave);
          message.error(res.message || dict.saveError);
        }
      } else if (jobId) {
        const res = await updateJobTranslation(jobId, translations);

        if (res.responseCode === RESPONSE_CODE.SUCCESS) {
          pendingUploads.commit();
          message.success(res.message || dict.updateSuccess);
          await loadDetail();
          remountDescriptionEditors();
        } else {
          await pendingUploads.rollback(uploadedOnSave);
          message.error(res.message || dict.saveError);
        }
      }
    } catch (error) {
      await pendingUploads.rollback(uploadedOnSave);
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
          <Link href={jobsPath}>
            <Button icon={<ArrowLeftOutlined />}>{dict.back}</Button>
          </Link>
          <Typography.Title level={4} className="!mb-0">
            {mode === "create" ? dict.createTitle : dict.editTitle}
          </Typography.Title>
        </Space>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Typography.Title level={5}>{dict.metadata}</Typography.Title>
          {mode === "edit" && (
            <Typography.Paragraph type="secondary" className="!mb-4">
              {dict.editMetadataHint}
            </Typography.Paragraph>
          )}

          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="status" label={dict.status} rules={[{ required: true }]}>
                <Select
                  disabled={mode === "edit"}
                  options={[
                    { value: JOB_STATUS.ACTIVE, label: dict.statusActive },
                    { value: JOB_STATUS.INACTIVE, label: dict.statusInactive },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="quantity" label={dict.quantity} rules={[{ required: true }]}>
                <InputNumber min={1} className="!w-full" disabled={mode === "edit"} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="jobType" label={dict.jobType} rules={[{ required: true }]}>
                <Select disabled={mode === "edit"} options={jobTypeOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="postedAt" label={dict.postedAt} rules={[{ required: true }]}>
                <DatePicker className="!w-full" showTime disabled={mode === "edit"} />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} className="!mt-4">
            {dict.translations}
          </Typography.Title>

          <Tabs
            destroyOnHidden={false}
            items={JOB_LANG_CODES.map((langCode) => ({
              key: langCode,
              label: langCode === "vi" ? dict.langVi : dict.langEn,
              children: (
                <>
                  <Row gutter={[16, 0]}>
                    {JOB_TRANSLATION_FIELDS.filter((f) => f !== "Description").map((field) => (
                      <Col xs={24} md={12} key={`${field}-${langCode}`}>
                        <Form.Item
                          name={["translations", field, langCode]}
                          label={dict[fieldLabelMap[field]] as string}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                  <Form.Item
                    name={["translations", "Description", langCode]}
                    label={dict.fieldDescription}
                    className="!mt-2"
                  >
                    <HtmlEditor
                      key={`description-${langCode}-${editorMountKey}`}
                      ref={(instance) => {
                        editorRefs.current[langCode] = instance;
                      }}
                      onHtmlDraftChange={descriptionDraftHandlers[langCode]}
                      onPendingUpload={pendingUploads.trackUpload}
                      savedMediaPaths={[...savedMediaPaths]}
                      dict={dict.editor}
                      fileNamePrefix={`${descriptionFilePrefix}-${langCode}`}
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
