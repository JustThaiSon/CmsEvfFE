"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Image,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { TablePaginationConfig } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { Locale } from "@/i18n/config";
import { CMS_ROUTES } from "@/constants";
import { isValidGuid } from "@/constants/guid";
import { NEW_FEATURED, NEW_STATUS } from "@/constants/new";
import { RESPONSE_CODE } from "@/constants/auth";
import { mapListNewCmsRes } from "@/lib/new-map";
import { normalizePagination } from "@/lib/pagination";
import { deleteNew, getListNewCms } from "@/services/new.api";
import type { GetListNewCmsRes } from "@/types/new";
import { localePath } from "@/utils/locale-path";
import { formatDateTime } from "@/utils/format.date";
import { resolveMediaUrl } from "@/utils/media-url";

type NewListDict = {
  title: string;
  create: string;
  titleCol: string;
  thumbnailCol: string;
  statusCol: string;
  featuredCol: string;
  createdAtCol: string;
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
  featuredYes: string;
  featuredNo: string;
};

type NewListProps = {
  lang: Locale;
  dict: NewListDict;
};

const DEFAULT_PAGE_SIZE = 10;

export default function NewList({ lang, dict }: NewListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetListNewCmsRes[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [listLang, setListLang] = useState(lang);

  const postsBase = localePath(CMS_ROUTES.POSTS, lang);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getListNewCms({
        lang: listLang,
        pageNumber: page,
        pageSize,
      });

      if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
        const paged = normalizePagination(res.data);
        const records = paged.records.map(mapListNewCmsRes);
        if (records.some((r) => !isValidGuid(r.id))) {
          message.warning(dict.invalidId);
        }
        setData(records);
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
  }, [page, pageSize, listLang, dict.loadError, dict.invalidId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteNew({ id });
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

  const columns = [
    {
      title: dict.thumbnailCol,
      dataIndex: "thumpUrl",
      key: "thumpUrl",
      width: 88,
      render: (url: string) =>
        url ? (
          <Image
            src={resolveMediaUrl(url)}
            alt=""
            width={56}
            height={56}
            className="object-cover rounded"
            preview
          />
        ) : (
          "—"
        ),
    },
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
        <Tag color={status === NEW_STATUS.ACTIVE ? "green" : "default"}>
          {status === NEW_STATUS.ACTIVE ? dict.statusActive : dict.statusInactive}
        </Tag>
      ),
    },
    {
      title: dict.featuredCol,
      dataIndex: "isFeatured",
      key: "isFeatured",
      width: 120,
      render: (featured: number) => (
        <Tag color={featured === NEW_FEATURED.YES ? "gold" : "default"}>
          {featured === NEW_FEATURED.YES ? dict.featuredYes : dict.featuredNo}
        </Tag>
      ),
    },
    {
      title: dict.createdAtCol,
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (date: string) => formatDateTime(date, lang),
    },
    {
      title: dict.actions,
      key: "actions",
      width: 140,
      render: (_: unknown, record: GetListNewCmsRes) => {
        const validId = isValidGuid(record.id);
        return (
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            {validId ? (
              <Link href={`${postsBase}/${record.id}/edit`}>
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
            <Select
              value={listLang}
              onChange={(v) => {
                setListLang(v);
                setPage(1);
              }}
              style={{ width: 120 }}
              options={[
                { value: "vi", label: "Tiếng Việt" },
                { value: "en", label: "English" },
              ]}
            />
            <Typography.Text type="secondary">
              {dict.total.replace("{count}", String(total))}
            </Typography.Text>
            <Link href={`${postsBase}/new`}>
              <Button type="primary" icon={<PlusOutlined />}>
                {dict.create}
              </Button>
            </Link>
          </Space>
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
                router.push(`${postsBase}/${record.id}/edit`);
              }
            },
            className: isValidGuid(record.id) ? "cursor-pointer" : "",
          })}
        />
      </Card>
    </div>
  );
}
