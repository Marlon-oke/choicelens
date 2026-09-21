import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categoriesMeta,
  categoryIds,
  productsByCategory,
  type CategoryId,
  getSmartphoneFilterOptions,
} from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import ScoreBar from "@/components/ScoreBar";
import WishlistButton from "@/components/WishlistButton";
import FilterBar from "@/components/category/FilterBar";

export function generateStaticParams() {
  return categoryIds.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meta = categoriesMeta[id as CategoryId];
  if (!meta) return { title: "Kategori tidak ditemukan — ChoiceLens" };
  return { title: `${meta.name} — ChoiceLens`, description: meta.desc };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const meta = categoriesMeta[id as CategoryId];
  if (!meta) notFound();

  const sp = await searchParams;
  const brandFilter = typeof sp.brand === "string" ? sp.brand : undefined;

  const allProducts = productsByCategory(meta.id as CategoryId);
  const filterOptions = getSmartphoneFilterOptions(allProducts);

  const filteredItems = allProducts.filter((p) => {
    if (brandFilter && p.brand !== brandFilter) return false;
    return true;
  });

  return (
    <main className="section">
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/" },
          { label: meta.name },
        ]}
        title={`${meta.icon} ${meta.name}`}
        desc={meta.desc}
      />

      <FilterBar
        metaId={meta.id}
        filterOptions={filterOptions}
        brandFilter={brandFilter}
      />

      {filteredItems.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 32,
            textAlign: "center",
            color: "#64748b",
            fontSize: 13,
          }}
        >
          Tidak ada produk yang cocok dengan filter.
        </div>
      ) : (
        <>
          <div className="comparison-grid">
            {filteredItems.map((p) => (
              <article key={p.id} className="compare-card" style={{ textAlign: "center" }}>
                <div style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.img}
                    alt={p.name}
                    style={{ width: "100%", height: 150, objectFit: "contain" }}
                  />
                  <span style={{ position: "absolute", top: 0, left: 0 }}>
                    <WishlistButton productId={p.id} />
                  </span>
                </div>
                <Link
                  href={`/product/${p.id}`}
                  style={{ fontSize: 12, display: "block", marginTop: 8, fontWeight: 800, color: "#0f172a", textDecoration: "none" }}
                >
                  {p.name}
                </Link>
                <small style={{ fontSize: 10, color: "#64748b" }}>{p.brand}</small>
                <div className="scores" style={{ gridTemplateColumns: "1fr" }}>
                  <ScoreBar score={p.score} label={`${p.score}/100`} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <Link href={`/compare?a=${p.id}`} className="view-all">
                    Bandingkan →
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#64748b", marginTop: 12 }}>
            Mau lihat comparison yang sudah dirakit editor?{" "}
            <Link href="/compare">Lihat comparison curated →</Link>
          </p>
        </>
      )}
    </main>
  );
}