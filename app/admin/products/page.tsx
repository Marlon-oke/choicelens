import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { ensureCatalog, getCatalogSync } from "@/lib/catalog";
import PageHeader from "@/components/PageHeader";
import AdminProductGenerator from "@/components/AdminProductGenerator";
import AdminProductTable from "@/components/AdminProductTable";

export const metadata: Metadata = {
  title: "Kelola Produk (AI) — ChoiceLens",
  description: "Tambah produk katalog dengan bantuan AI.",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const me = await requireAdmin();
  await ensureCatalog();
  const items = getCatalogSync();
  void me;

  const sp = await searchParams;
  const editRaw = sp.edit;
  const editId = Array.isArray(editRaw) ? editRaw[0] : editRaw;
  const editItem = editId ? items.find((p) => p.id === editId) : undefined;
  const initial = editItem
    ? {
        id: editItem.id,
        name: editItem.name,
        brand: editItem.brand,
        category: editItem.category,
        img: editItem.img,
        score: editItem.score,
        keywords: editItem.keywords,
        strengths: editItem.strengths,
        specs: editItem.specs,
        ratings: editItem.ratings,
        affiliate: editItem.affiliate ?? [],
      }
    : undefined;

  return (
    <main className="section">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: "Produk" }]}
         title="Kelola Produk + AI"
        desc="Generate data produk dari AI, periksa, lalu simpan. Produk baru otomatis bisa di-compare (skor, verdict, dan token menyesuaikan datanya)."
      />

      <section
        style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, marginBottom: 16 }}
      >
        <AdminProductGenerator key={initial?.id ?? "baru"} initial={initial} />
      </section>

      <section
        style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, overflowX: "auto" }}
      >
        <h2 style={{ fontSize: 14, margin: "0 0 10px" }}>Katalog ({items.length})</h2>
        <AdminProductTable items={items} />
      </section>
    </main>
  );
}
