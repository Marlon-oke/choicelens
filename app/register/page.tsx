import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import PageHeader from "@/components/PageHeader";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar — ChoiceLens",
  description: "Buat akun ChoiceLens dan dapatkan 4 token gratis.",
};

export default async function RegisterPage() {
  const session = await verifySession();
  if (session) redirect("/dashboard");

  return (
    <main className="section" style={{ maxWidth: 480 }}>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Daftar" }]}
        title="Buat Akun"
        desc="Daftar gratis, langsung dapat 4 token (2x compare)."
      />
      <RegisterForm />
      <p style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
        Sudah punya akun?{" "}
        <Link
          href="/login"
          style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
        >
          Masuk
        </Link>
      </p>
    </main>
  );
}
