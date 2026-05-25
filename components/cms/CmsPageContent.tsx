import { Card } from "antd";

type CmsPageContentProps = {
  title: string;
  description: string;
};

export default function CmsPageContent({ title, description }: CmsPageContentProps) {
  return (
    <div className="p-6">
      <Card>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </Card>
    </div>
  );
}
