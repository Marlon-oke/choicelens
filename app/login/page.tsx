import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import PageHeader from "@/components/PageHeader";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login — ChoiceLens",
  description: "Masuk ke akun ChoiceLens untuk memakai token compare.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await verifySession();
  if (session) redirect("/dashboard");
  const { next = "/dashboard" } = await searchParams;
  const redirectTo = next.startsWith("/") ? next : "/dashboard";

  return (
    <main className="section" style={{ maxWidth: 480 }}>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Login" }]}
        title="Masuk"
        desc="Login untuk membuka hasil compare, wishlist, dan dashboard."
      />
      <LoginForm redirectTo={redirectTo} />
      <p style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
        Belum punya akun?{" "}
        <Link
          href="/register"
          style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
        >
          Daftar
        </Link>
      </p>
    </main>
  );
}
