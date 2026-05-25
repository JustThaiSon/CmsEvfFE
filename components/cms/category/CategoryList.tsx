"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Popconfirm, Select, Space, Table, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { Locale } from "@/i18n/config";
import { CMS_ROUTES } from "@/constants";
import { isValidGuid } from "@/constants/guid";
import { RESPONSE_CODE } from "@/constants/auth";
import { mapListCategoryRes } from "@/lib/category-map";
import { deleteCategory, getListCategory } from "@/services/category.api";
import type { GetListCategoryRes } from "@/types/category";
import { localePath } from "@/utils/locale-path";

type CategoryListDict = {
  title: string;
  create: string;
  nameCol: string;
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
};

type CategoryListProps = {
  lang: Locale;
  dict: CategoryListDict;
};

export default function CategoryList({ lang, dict }: CategoryListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetListCategoryRes[]>([]);
  const [listLang, setListLang] = useState(lang);

  const categoriesBase = localePath(CMS_ROUTES.CATEGORIES, lang);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getListCategory(listLang);

      if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
        const records = (Array.isArray(res.data) ? res.data : []).map(mapListCategoryRes);
        if (records.some((r) => !isValidGuid(r.id))) {
          message.warning(dict.invalidId);
        }
        setData(records);
      } else {
        message.error(res.message || dict.loadError);
        setData([]);
      }
    } catch {
      message.error(dict.loadError);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [listLang, dict.loadError, dict.invalidId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteCategory({ id });
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
      title: dict.nameCol,
      dataIndex: "categoryName",
      key: "categoryName",
      ellipsis: true,
    },
    {
      title: dict.actions,
      key: "actions",
      width: 140,
      render: (_: unknown, record: GetListCategoryRes) => {
        const validId = isValidGuid(record.id);
        return (
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            {validId ? (
              <Link href={`${categoriesBase}/${record.id}/edit`}>
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
              onChange={setListLang}
              style={{ width: 120 }}
              options={[
                { value: "vi", label: "Tiếng Việt" },
                { value: "en", label: "English" },
              ]}
            />
            <Typography.Text type="secondary">
              {dict.total.replace("{count}", String(data.length))}
            </Typography.Text>
            <Link href={`${categoriesBase}/new`}>
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
          pagination={false}
          onRow={(record) => ({
            onClick: () => {
              if (isValidGuid(record.id)) {
                router.push(`${categoriesBase}/${record.id}/edit`);
              }
            },
            className: isValidGuid(record.id) ? "cursor-pointer" : "",
          })}
        />
      </Card>
    </div>
  );
}
