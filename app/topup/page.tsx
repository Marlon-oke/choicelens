import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { getAccount } from "@/lib/account";
import PageHeader from "@/components/PageHeader";
import TopupClient from "@/components/TopupClient";

export const metadata: Metadata = {
  title: "Topup Token — ChoiceLens",
  description: "Beli token untuk membuka hasil compare. Rp500 per token.",
};

export default async function TopupPage() {
  const session = await verifySession();
  if (!session) redirect("/login?next=/topup");
  const account = await getAccount(session.userId);
  if (!account) redirect("/login?next=/topup");

  return (
    <main className="section" style={{ maxWidth: 560 }}>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Topup" }]}
        title="Topup Token"
        desc={`Saldo saat ini: ${account.balance} token. 1 hasil compare = 2 token. Setiap topup berlaku 1 bulan penuh (topup lagi = reset ke 1 bulan).`}
      />
      <TopupClient />
    </main>
  );
}
