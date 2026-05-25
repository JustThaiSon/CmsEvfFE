"use client";

import { useState } from "react";
import { Layout } from "antd";
import type { Locale } from "@/i18n/config";
import CmsSidebar from "./CmsSidebar";
import CmsHeader from "./CmsHeader";
import CmsFooter from "./CmsFooter";

type CmsDict = {
  brand: string;
  collapse: string;
  expand: string;
  viewSite: string;
  user: string;
  logout: string;
  footer: string;
  menu: {
    contactRequests: string;
    jobs: string;
    posts: string;
    categories: string;
  };
};

type CmsShellProps = {
  lang: Locale;
  dict: CmsDict;
  children: React.ReactNode;
};

export default function CmsShell({ lang, dict, children }: CmsShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen" hasSider>
      <CmsSidebar
        lang={lang}
        collapsed={collapsed}
        brand={dict.brand}
        labels={dict.menu}
      />
      <Layout>
        <CmsHeader
          lang={lang}
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
          brand={dict.brand}
          collapseLabel={dict.collapse}
          expandLabel={dict.expand}
          viewSiteLabel={dict.viewSite}
          userLabel={dict.user}
          logoutLabel={dict.logout}
        />
        <Layout.Content className="!bg-gray-50 min-h-[calc(100vh-56px-48px)]">
          {children}
        </Layout.Content>
        <CmsFooter text={dict.footer} />
      </Layout>
    </Layout>
  );
}
