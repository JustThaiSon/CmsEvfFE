import { Card } from "antd";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";

export default async function Detail1Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{dict.detail.detail1.title}</h2>
        <p className="text-gray-600">{dict.detail.detail1.description}</p>
      </Card>
    </div>
  );
}
