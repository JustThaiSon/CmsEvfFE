"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Drawer, Modal, Space, Table, Typography, message } from "antd";
import type { TablePaginationConfig } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { Locale } from "@/i18n/config";
import { RESPONSE_CODE } from "@/constants/auth";
import { mapCandidateRes } from "@/lib/candidate-map";
import { normalizePagination } from "@/lib/pagination";
import { getListCandidate } from "@/services/candidate.api";
import type { CandidateRes } from "@/types/candidate";
import { cvViewPath, getCvPreviewKind } from "@/utils/cv-preview";
import { formatDateTime } from "@/utils/format.date";
import { resolveMediaUrl } from "@/utils/media-url";

export type JobCandidatesDrawerDict = {
  title: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  message: string;
  createdDate: string;
  cv: string;
  viewCv: string;
  previewTitle: string;
  previewUnsupported: string;
  openInNewTab: string;
  empty: string;
  loadError: string;
  total: string;
};

type JobCandidatesDrawerProps = {
  open: boolean;
  jobId: string | null;
  jobTitle: string;
  lang: Locale;
  dict: JobCandidatesDrawerDict;
  onClose: () => void;
};

const DEFAULT_PAGE_SIZE = 10;

export default function JobCandidatesDrawer({
  open,
  jobId,
  jobTitle,
  lang,
  dict,
  onClose,
}: JobCandidatesDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CandidateRes[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [cvPreview, setCvPreview] = useState<{ cvUrl: string; fullName: string } | null>(
    null
  );

  const fetchList = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    try {
      const res = await getListCandidate({ jdId: jobId, pageNumber: page, pageSize });

      if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
        const paged = normalizePagination<CandidateRes>(res.data);
        setData(paged.records.map(mapCandidateRes));
        setTotal(paged.totalRecord);
      } else {
        message.error(res.message || dict.loadError);
        setData([]);
        setTotal(0);
      }
    } catch {
      message.error(dict.loadError);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [jobId, page, pageSize, dict.loadError]);

  useEffect(() => {
    if (!open || !jobId) return;
    fetchList();
  }, [open, jobId, fetchList]);

  useEffect(() => {
    if (open) {
      setPage(1);
      setPageSize(DEFAULT_PAGE_SIZE);
    }
  }, [open, jobId]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? DEFAULT_PAGE_SIZE);
  };

  const columns = [
    {
      title: dict.fullName,
      dataIndex: "fullName",
      key: "fullName",
      width: 160,
      ellipsis: true,
    },
    {
      title: dict.email,
      dataIndex: "email",
      key: "email",
      ellipsis: true,
    },
    {
      title: dict.phone,
      dataIndex: "phone",
      key: "phone",
      width: 120,
      render: (phone: string) => phone || "—",
    },
    {
      title: dict.address,
      dataIndex: "address",
      key: "address",
      width: 140,
      ellipsis: true,
      render: (address: string) => address || "—",
    },
    {
      title: dict.createdDate,
      dataIndex: "createdDate",
      key: "createdDate",
      width: 160,
      render: (date: string) => formatDateTime(date, lang),
    },
    {
      title: dict.cv,
      key: "cv",
      width: 100,
      render: (_: unknown, record: CandidateRes) =>
        record.cvUrl ? (
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setCvPreview({ cvUrl: record.cvUrl, fullName: record.fullName })}
          >
            {dict.viewCv}
          </Button>
        ) : (
          "—"
        ),
    },
    {
      title: dict.message,
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (msg: string | null | undefined) => msg || "—",
    },
  ];

  const previewKind = cvPreview ? getCvPreviewKind(cvPreview.cvUrl) : null;
  const previewSrc = cvPreview ? cvViewPath(cvPreview.cvUrl) : "";

  return (
    <Drawer
      title={dict.title.replace("{title}", jobTitle || "—")}
      open={open}
      onClose={onClose}
      size={
        typeof window !== "undefined" ? Math.min(960, window.innerWidth - 48) : 960
      }
      destroyOnHidden
    >
      <Space className="w-full justify-between mb-4" align="center">
        <Typography.Text type="secondary">
          {dict.total.replace("{count}", String(total))}
        </Typography.Text>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        locale={{ emptyText: dict.empty }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
      />

      <Modal
        title={dict.previewTitle.replace("{name}", cvPreview?.fullName ?? "")}
        open={!!cvPreview}
        onCancel={() => setCvPreview(null)}
        footer={
          cvPreview ? (
            <Button
              type="primary"
              href={resolveMediaUrl(cvPreview.cvUrl)}
              target="_blank"
              rel="noreferrer"
            >
              {dict.openInNewTab}
            </Button>
          ) : null
        }
        width="min(920px, 96vw)"
        destroyOnHidden
        styles={{ body: { padding: previewKind === "unsupported" ? 24 : 0 } }}
      >
        {cvPreview && previewKind === "pdf" && (
          <iframe
            title={dict.previewTitle.replace("{name}", cvPreview.fullName)}
            src={previewSrc}
            className="block w-full border-0"
            style={{ height: "75vh", minHeight: 480 }}
          />
        )}
        {cvPreview && previewKind === "image" && (
          <div className="flex justify-center p-4 bg-neutral-50 max-h-[75vh] overflow-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt={cvPreview.fullName}
              className="max-w-full h-auto object-contain"
            />
          </div>
        )}
        {cvPreview && previewKind === "unsupported" && (
          <Typography.Paragraph className="!mb-4">{dict.previewUnsupported}</Typography.Paragraph>
        )}
      </Modal>
    </Drawer>
  );
}
