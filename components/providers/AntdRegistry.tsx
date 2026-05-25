"use client";

import { AntdRegistry as AntdRegistryLib } from "@ant-design/nextjs-registry";

export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  return <AntdRegistryLib>{children}</AntdRegistryLib>;
}
