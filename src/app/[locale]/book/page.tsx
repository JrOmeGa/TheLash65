import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SignInButtons } from "@/components/auth/SignInButtons";

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1
        className="text-2xl font-semibold text-[#1F1B18] mb-2 text-center"
        style={{ fontFamily: "var(--font-noto-serif), var(--font-sarabun), serif" }}
      >
        {t("bookTitle")}
      </h1>

      {session ? (
        <div className="text-center" data-testid="book-authenticated">
          <p className="text-[#6B5E54] mb-6" style={{ fontFamily: "var(--font-manrope), var(--font-sarabun), sans-serif" }}>
            {t("authenticated", { name: session.user.name })}
          </p>
          {/* Phase 3 will replace this with the full booking wizard */}
          <p className="text-sm text-[#9c8577]">{t("comingSoon")}</p>
        </div>
      ) : (
        <div data-testid="book-signin-step">
          <p className="text-[#6B5E54] mb-6 text-center" style={{ fontFamily: "var(--font-manrope), var(--font-sarabun), sans-serif" }}>
            {t("signInPrompt")}
          </p>
          <SignInButtons />
        </div>
      )}
    </div>
  );
}
