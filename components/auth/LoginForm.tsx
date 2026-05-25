"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Form, Input, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import type { Locale } from "@/i18n/config";
import { CMS_DEFAULT_ROUTE } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { localePath } from "@/utils/locale-path";

type LoginDict = {
  title: string;
  subtitle: string;
  userName: string;
  password: string;
  submit: string;
  userNameRequired: string;
  passwordRequired: string;
  loginFailed: string;
};

type LoginFormProps = {
  lang: Locale;
  dict: LoginDict;
};

export default function LoginForm({ lang, dict }: LoginFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, isReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isReady && isAuthenticated) {
      const redirect = searchParams.get("redirect");
      const safeRedirect =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : localePath(CMS_DEFAULT_ROUTE, lang);
      router.replace(safeRedirect);
    }
  }, [isAuthenticated, isReady, lang, router, searchParams]);

  const onFinish = async (values: { userName: string; password: string }) => {
    setLoading(true);
    setError(null);

    const result = await login(values.userName, values.password);

    setLoading(false);

    if (result.success) {
      const redirect = searchParams.get("redirect");
      const safeRedirect =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : localePath(CMS_DEFAULT_ROUTE, lang);
      router.replace(safeRedirect);
      return;
    }

    setError(result.message || dict.loginFailed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-md">
        <div className="text-center mb-6">
          <Typography.Title level={3} className="!mb-1">
            {dict.title}
          </Typography.Title>
          <Typography.Text type="secondary">{dict.subtitle}</Typography.Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="userName"
            label={dict.userName}
            rules={[{ required: true, message: dict.userNameRequired }]}
          >
            <Input prefix={<UserOutlined />} placeholder={dict.userName} autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            label={dict.password}
            rules={[{ required: true, message: dict.passwordRequired }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={dict.password}
              autoComplete="current-password"
            />
          </Form.Item>

          {error && (
            <Typography.Text type="danger" className="block mb-4">
              {error}
            </Typography.Text>
          )}

          <Form.Item className="!mb-0">
            <Button type="primary" htmlType="submit" loading={loading} block>
              {dict.submit}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
