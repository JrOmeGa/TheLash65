import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  // D-06: Owner identified by ADMIN_EMAIL env var
  // D-07: No role column — env var check only
  // D-08: Unauthorized access redirects to /book silently (no 403 page)
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect(`/${locale}/book`);
  }

  return <>{children}</>;
}
