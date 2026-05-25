import { Button, Card } from "antd";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card title={dict.home.title} className="w-96">
        <div className="flex flex-col gap-4">
          <Button type="primary">{dict.home.greeting}</Button>
          <LanguageSwitcher lang={lang} />
          {/* Test SCSS */}
          <div className="test-scss">
            <div className="test-scss__title">SCSS hoạt động ✅</div>
            <div className="test-scss__desc">Nesting, variables đều ăn</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
