"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Descriptions, Space, Spin, Tag, Typography, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { Locale } from "@/i18n/config";
import { CMS_ROUTES } from "@/constants";
import { RESPONSE_CODE } from "@/constants/auth";
import { localePath } from "@/utils/locale-path";
import { formatDateTime } from "@/utils/format.date";
import { getContactRequestDetail } from "@/services/contact-request.api";
import type { ContactRequestRes } from "@/types/contact-request";

type ContactRequestDetailDict = {
  title: string;
  back: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  isAgreed: string;
  agreed: string;
  notAgreed: string;
  createdDate: string;
  loadError: string;
  notFound: string;
};

type ContactRequestDetailViewProps = {
  lang: Locale;
  id: string;
  dict: ContactRequestDetailDict;
};

export default function ContactRequestDetailView({
  lang,
  id,
  dict,
}: ContactRequestDetailViewProps) {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<ContactRequestRes | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getContactRequestDetail({ id, lang });

      if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data) {
        setItem(res.data);
      } else if (res.responseCode === RESPONSE_CODE.NOT_FOUND) {
        setItem(null);
        message.warning(res.message || dict.notFound);
      } else {
        setItem(null);
        message.error(res.message || dict.loadError);
      }
    } catch {
      setItem(null);
      message.error(dict.loadError);
    } finally {
      setLoading(false);
    }
  }, [id, lang, dict.loadError, dict.notFound]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const listPath = localePath(CMS_ROUTES.CONTACT_REQUESTS, lang);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[320px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6">
        <Link href={listPath}>
          <Button icon={<ArrowLeftOutlined />}>{dict.back}</Button>
        </Link>
        <Typography.Paragraph type="secondary" className="mt-4">
          {dict.notFound}
        </Typography.Paragraph>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <Space direction="vertical" size="large" className="w-full">
          <Space>
            <Link href={listPath}>
              <Button icon={<ArrowLeftOutlined />}>{dict.back}</Button>
            </Link>
            <Typography.Title level={4} className="!mb-0">
              {dict.title}
            </Typography.Title>
          </Space>

          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label={dict.fullName}>{item.fullName}</Descriptions.Item>
            <Descriptions.Item label={dict.email}>{item.email}</Descriptions.Item>
            <Descriptions.Item label={dict.phone}>{item.phone || "—"}</Descriptions.Item>
            <Descriptions.Item label={dict.createdDate}>
              {formatDateTime(item.createdDate, lang)}
            </Descriptions.Item>
            <Descriptions.Item label={dict.isAgreed}>
              <Tag color={item.isAgreed ? "green" : "default"}>
                {item.isAgreed ? dict.agreed : dict.notAgreed}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={dict.message}>
              <Typography.Paragraph className="!mb-0 whitespace-pre-wrap">
                {item.message || "—"}
              </Typography.Paragraph>
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </div>
  );
}
