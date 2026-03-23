import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12" data-testid="admin-dashboard">
      <h1
        className="text-2xl font-semibold text-[#1F1B18] mb-4"
        style={{ fontFamily: "var(--font-noto-serif), var(--font-sarabun), serif" }}
      >
        Admin Dashboard
      </h1>
      <p className="text-[#6B5E54]" style={{ fontFamily: "var(--font-manrope), var(--font-sarabun), sans-serif" }}>
        Dashboard content coming in Phase 6.
      </p>
      <nav className="mt-6">
        <Link
          href={`/${locale}/admin/schedule`}
          data-testid="admin-schedule-link"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[16px] font-semibold"
          style={{
            fontFamily: "var(--font-manrope), var(--font-sarabun), sans-serif",
            background: "linear-gradient(135deg, #755944 0%, #9c7660 100%)",
            color: "#ffffff",
          }}
        >
          {t("schedule")}
        </Link>
      </nav>
    </div>
  );
}
