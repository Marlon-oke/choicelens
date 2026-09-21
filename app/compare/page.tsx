import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { comparisons } from "@/lib/data";
import { ensureCatalog } from "@/lib/catalog";
import { verifySession } from "@/lib/session";
import CompareStudio from "@/components/CompareStudio";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Compare Barang — ChoiceLens",
  description:
    "Pilih 2 barang satuan dan bandingkan sesukamu.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await verifySession();
  if (!session) {
    const params = await searchParams;
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === "string" && v) qs.set(k, v);
      else if (Array.isArray(v) && v[0]) qs.set(k, v[0]);
    }
    const back = qs.size > 0 ? `/compare?${qs.toString()}` : "/compare";
    redirect(`/login?next=${encodeURIComponent(back)}`);
  }

  const products = await ensureCatalog();

  return (
    <main className="section">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Compare" }]}
        title="Compare Barang Satuan"
        desc="Pilih 2 produk dalam kategori yang sama, merek bebas. Hasil curated ada di bawah."
      />
      <Suspense>
        <CompareStudio allProducts={products} popular={comparisons} />
      </Suspense>
    </main>
  );
}
