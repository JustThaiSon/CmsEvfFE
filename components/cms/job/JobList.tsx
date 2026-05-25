"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { TablePaginationConfig } from "antd";
import { PlusOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import JobCandidatesDrawer, {
  type JobCandidatesDrawerDict,
} from "@/components/cms/job/JobCandidatesDrawer";
import type { Locale } from "@/i18n/config";
import { CMS_ROUTES } from "@/constants";
import { isValidGuid } from "@/constants/guid";
import { JOB_STATUS, JOB_TYPE } from "@/constants/job";
import { RESPONSE_CODE } from "@/constants/auth";
import { localePath } from "@/utils/locale-path";
import { formatDateTime } from "@/utils/format.date";
import { deleteJob, getListJobCms } from "@/services/job.api";
import type { GetListJobCmsRes } from "@/types/job";

type JobListDict = {
  title: string;
  create: string;
  searchPlaceholder: string;
  search: string;
  statusAll: string;
  titleCol: string;
  statusCol: string;
  quantityCol: string;
  jobTypeCol: string;
  postedAtCol: string;
  actions: string;
  edit: string;
  delete: string;
  deleteConfirm: string;
  empty: string;
  loadError: string;
  deleteSuccess: string;
  deleteError: string;
  invalidId: string;
  total: string;
  statusActive: string;
  statusInactive: string;
  jobTypeFullTime: string;
  jobTypePartTime: string;
  jobTypeContract: string;
  jobTypeInternship: string;
  candidates: string;
  candidatesDrawer: JobCandidatesDrawerDict;
};

type JobListProps = {
  lang: Locale;
  dict: JobListDict;
};

const DEFAULT_PAGE_SIZE = 10;

export default function JobList({ lang, dict }: JobListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetListJobCmsRes[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const [candidatesOpen, setCandidatesOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ id: string; title: string } | null>(
    null
  );

  const jobsBase = localePath(CMS_ROUTES.JOBS, lang);

  const statusLabel = (status: number) =>
    status === JOB_STATUS.ACTIVE ? dict.statusActive : dict.statusInactive;

  const jobTypeLabel = (type: number) => {
    switch (type) {
      case JOB_TYPE.FULL_TIME:
        return dict.jobTypeFullTime;
      case JOB_TYPE.PART_TIME:
        return dict.jobTypePartTime;
      case JOB_TYPE.CONTRACT:
        return dict.jobTypeContract;
      case JOB_TYPE.INTERNSHIP:
        return dict.jobTypeInternship;
      default:
        return String(type);
    }
  };

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getListJobCms({
        lang,
        pageNumber: page,
        pageSize,
        keyword: searchKeyword,
        status: statusFilter,
      });

      if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
        const records = res.data.records ?? [];
        const hasInvalidId = records.some((r) => !isValidGuid(r.id));
        if (hasInvalidId) {
          message.warning(dict.invalidId);
        }
        setData(records);
        setTotal(res.data.totalRecord ?? 0);
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
  }, [page, pageSize, lang, searchKeyword, statusFilter, dict.loadError]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleDelete = async (jobId: string) => {
    try {
      const res = await deleteJob({ jobId });
      if (res.responseCode === RESPONSE_CODE.SUCCESS) {
        message.success(res.message || dict.deleteSuccess);
        fetchList();
      } else {
        message.error(res.message || dict.deleteError);
      }
    } catch {
      message.error(dict.deleteError);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearchKeyword(keyword.trim() || undefined);
  };

  const openCandidates = (record: GetListJobCmsRes) => {
    setSelectedJob({ id: record.id, title: record.title });
    setCandidatesOpen(true);
  };

  const closeCandidates = () => {
    setCandidatesOpen(false);
    setSelectedJob(null);
  };

  const columns = [
    {
      title: dict.titleCol,
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: dict.statusCol,
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: number) => (
        <Tag color={status === JOB_STATUS.ACTIVE ? "green" : "default"}>
          {statusLabel(status)}
        </Tag>
      ),
    },
    {
      title: dict.jobTypeCol,
      dataIndex: "jobType",
      key: "jobType",
      width: 140,
      render: (jobType: number) => jobTypeLabel(jobType),
    },
    {
      title: dict.quantityCol,
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: dict.postedAtCol,
      dataIndex: "postedAt",
      key: "postedAt",
      width: 170,
      render: (date: string) => formatDateTime(date, lang),
    },
    {
      title: dict.actions,
      key: "actions",
      width: 220,
      render: (_: unknown, record: GetListJobCmsRes) => {
        const validId = isValidGuid(record.id);
        return (
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Button
              type="link"
              size="small"
              icon={<TeamOutlined />}
              disabled={!validId}
              onClick={() => openCandidates(record)}
            >
              {dict.candidates}
            </Button>
            {validId ? (
              <Link href={`${jobsBase}/${record.id}/edit`}>
                <Button type="link" size="small">
                  {dict.edit}
                </Button>
              </Link>
            ) : (
              <Button type="link" size="small" disabled>
                {dict.edit}
              </Button>
            )}
            <Popconfirm
              title={dict.deleteConfirm}
              onConfirm={() => handleDelete(record.id)}
              okButtonProps={{ danger: true }}
              disabled={!validId}
            >
              <Button type="link" size="small" danger disabled={!validId}>
                {dict.delete}
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <Space className="w-full justify-between mb-4 flex-wrap" align="center">
          <Typography.Title level={4} className="!mb-0">
            {dict.title}
          </Typography.Title>
          <Space wrap>
            <Typography.Text type="secondary">
              {dict.total.replace("{count}", String(total))}
            </Typography.Text>
            <Link href={`${jobsBase}/new`}>
              <Button type="primary" icon={<PlusOutlined />}>
                {dict.create}
              </Button>
            </Link>
          </Space>
        </Space>

        <Space className="mb-4 flex-wrap" wrap>
          <Input
            placeholder={dict.searchPlaceholder}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            allowClear
            placeholder={dict.statusCol}
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(v) => {
              setPage(1);
              setStatusFilter(v);
            }}
            options={[
              { value: JOB_STATUS.ACTIVE, label: dict.statusActive },
              { value: JOB_STATUS.INACTIVE, label: dict.statusInactive },
            ]}
          />
          <Button icon={<SearchOutlined />} onClick={handleSearch}>
            {dict.search}
          </Button>
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
          onChange={(pagination: TablePaginationConfig) => {
            setPage(pagination.current ?? 1);
            setPageSize(pagination.pageSize ?? DEFAULT_PAGE_SIZE);
          }}
          onRow={(record) => ({
            onClick: () => {
              if (isValidGuid(record.id)) {
                router.push(`${jobsBase}/${record.id}/edit`);
              }
            },
            className: isValidGuid(record.id) ? "cursor-pointer" : "",
          })}
        />

        <JobCandidatesDrawer
          open={candidatesOpen}
          jobId={selectedJob?.id ?? null}
          jobTitle={selectedJob?.title ?? ""}
          lang={lang}
          dict={dict.candidatesDrawer}
          onClose={closeCandidates}
        />
      </Card>
    </div>
  );
}
