import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { getAccount } from "@/lib/account";
import PageHeader from "@/components/PageHeader";
import AdminLoginForm from "@/components/AdminLoginForm";

export const metadata: Metadata = {
  title: "Login Admin — ChoiceLens",
  description: "Masuk ke dashboard admin ChoiceLens.",
};

export default async function AdminLoginPage() {
  const session = await verifySession();
  if (session) {
    const account = await getAccount(session.userId);
    if (account?.role === "admin") redirect("/admin");
    redirect("/dashboard");
  }

  return (
    <main className="section" style={{ maxWidth: 480 }}>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Admin" }]}
        title="🛡 Login Admin"
        desc="Khusus pengelola. Akun biasa tidak bisa masuk lewat sini."
      />
      <AdminLoginForm />
      <p style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
        Bukan admin?{" "}
        <Link href="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
          Login biasa
        </Link>
      </p>
    </main>
  );
}
