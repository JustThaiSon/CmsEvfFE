"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Layout, Space, Typography } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { Locale } from "@/i18n/config";
import { ROUTES } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { localePath } from "@/utils/locale-path";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

type CmsHeaderProps = {
  lang: Locale;
  collapsed: boolean;
  onToggle: () => void;
  brand: string;
  collapseLabel: string;
  expandLabel: string;
  viewSiteLabel: string;
  userLabel: string;
  logoutLabel: string;
};

export default function CmsHeader({
  lang,
  collapsed,
  onToggle,
  brand,
  collapseLabel,
  expandLabel,
  viewSiteLabel,
  userLabel,
  logoutLabel,
}: CmsHeaderProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace(localePath(ROUTES.LOGIN, lang));
  };

  return (
    <Layout.Header className="!bg-white !border-b !border-gray-200 !px-4 flex items-center justify-between !h-14 !leading-[56px]">
      <Space size="middle">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          aria-label={collapsed ? expandLabel : collapseLabel}
        />
        <Typography.Text strong className="!text-base">
          {brand}
        </Typography.Text>
      </Space>

      <Space size="middle">
        <Link href={localePath(ROUTES.HOME, lang)}>
          <Button type="link" icon={<GlobalOutlined />}>
            {viewSiteLabel}
          </Button>
        </Link>
        <LanguageSwitcher lang={lang} />
        <Typography.Text type="secondary">{userLabel}</Typography.Text>
        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
          {logoutLabel}
        </Button>
      </Space>
    </Layout.Header>
  );
}
