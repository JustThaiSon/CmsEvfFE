import { Layout } from "antd";

type CmsFooterProps = {
  text: string;
};

export default function CmsFooter({ text }: CmsFooterProps) {
  return (
    <Layout.Footer className="!bg-white !border-t !border-gray-200 !py-3 !px-6 text-center text-sm text-gray-500">
      {text}
    </Layout.Footer>
  );
}
