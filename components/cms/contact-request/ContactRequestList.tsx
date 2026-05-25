"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Space, Table, Typography, message } from "antd";
import type { TablePaginationConfig } from "antd";
import type { Locale } from "@/i18n/config";
import { CMS_ROUTES } from "@/constants";
import { RESPONSE_CODE } from "@/constants/auth";
import { localePath } from "@/utils/locale-path";
import { formatDateTime } from "@/utils/format.date";
import { getContactRequests } from "@/services/contact-request.api";
import type { ContactRequestRes } from "@/types/contact-request";

type ContactRequestListDict = {
  title: string;
  fullName: string;
  email: string;
  phone: string;
  createdDate: string;
  actions: string;
  viewDetail: string;
  agreed: string;
  notAgreed: string;
  empty: string;
  loadError: string;
  total: string;
};

type ContactRequestListProps = {
  lang: Locale;
  dict: ContactRequestListDict;
};

const DEFAULT_PAGE_SIZE = 10;

export default function ContactRequestList({ lang, dict }: ContactRequestListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ContactRequestRes[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getContactRequests({ page, pageSize, lang });

      if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
        setData(res.data.records ?? []);
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
  }, [page, pageSize, lang, dict.loadError]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? DEFAULT_PAGE_SIZE);
  };

  const detailBasePath = localePath(CMS_ROUTES.CONTACT_REQUESTS, lang);

  const columns = [
    {
      title: dict.fullName,
      dataIndex: "fullName",
      key: "fullName",
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
      render: (phone: string | null | undefined) => phone || "—",
    },
    {
      title: dict.createdDate,
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date: string) => formatDateTime(date, lang),
    },
    {
      title: dict.actions,
      key: "actions",
      width: 120,
      render: (_: unknown, record: ContactRequestRes) => (
        <Link href={`${detailBasePath}/${record.id}`} onClick={(e) => e.stopPropagation()}>
          <Button type="link" size="small">
            {dict.viewDetail}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <Space className="w-full justify-between mb-4" align="center">
          <Typography.Title level={4} className="!mb-0">
            {dict.title}
          </Typography.Title>
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
          onRow={(record) => ({
            onClick: () => router.push(`${detailBasePath}/${record.id}`),
            className: "cursor-pointer",
          })}
        />
      </Card>
    </div>
  );
}
