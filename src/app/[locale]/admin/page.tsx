import { setRequestLocale } from "next-intl/server";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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
    </div>
  );
}
