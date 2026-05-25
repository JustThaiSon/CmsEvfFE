"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  FileTextOutlined,
  IdcardOutlined,
  MailOutlined,
} from "@ant-design/icons";
import type { Locale } from "@/i18n/config";
import { CMS_MENU_ITEMS } from "@/constants";
import { localePath } from "@/utils/locale-path";

const MENU_ICONS = {
  contactRequests: MailOutlined,
  jobs: IdcardOutlined,
  posts: FileTextOutlined,
  categories: AppstoreOutlined,
} as const;

type CmsSidebarProps = {
  lang: Locale;
  collapsed: boolean;
  brand: string;
  labels: Record<(typeof CMS_MENU_ITEMS)[number]["key"], string>;
};

export default function CmsSidebar({ lang, collapsed, brand, labels }: CmsSidebarProps) {
  const pathname = usePathname();

  const selectedKey =
    [...CMS_MENU_ITEMS]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => {
        const href = localePath(item.href, lang);
        return pathname === href || pathname.startsWith(`${href}/`);
      })?.key ?? CMS_MENU_ITEMS[0].key;

  const menuItems = CMS_MENU_ITEMS.map((item) => {
    const Icon = MENU_ICONS[item.key];
    const href = localePath(item.href, lang);

    return {
      key: item.key,
      icon: <Icon />,
      label: <Link href={href}>{labels[item.key]}</Link>,
    };
  });

  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={240}
      className="!bg-[#001529] !order-first"
      theme="dark"
      style={{ position: "sticky", top: 0, height: "100vh", insetInlineStart: 0 }}
    >
      <div
        className={`h-14 flex items-center justify-center font-semibold text-white border-b border-white/10 ${
          collapsed ? "text-xs px-2" : "text-lg"
        }`}
      >
        {collapsed ? "EVF" : brand}
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
    </Layout.Sider>
  );
}
