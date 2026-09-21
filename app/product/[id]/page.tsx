import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProduct,
  productsByCategory,
  comparisons,
  findProductIdByName,
  learnItems,
  productBlurb,
  type Product,
} from "@/lib/data";
import { ensureCatalog, getCatalogSync } from "@/lib/catalog";
import PageHeader from "@/components/PageHeader";
import ScoreBar from "@/components/ScoreBar";
import WishlistButton from "@/components/WishlistButton";
import BuyButtons from "@/components/BuyButtons";
import ProductVariantSection from "@/components/ProductVariantSection";

export function generateStaticParams() {
  return getCatalogSync().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  await ensureCatalog();
  const p = getProduct(id);
  if (!p) return { title: "Produk tidak ditemukan — ChoiceLens" };
  return {
    title: `${p.name} — ChoiceLens`,
    description: summarize(p),
  };
}

function summarize(p: Product): string {
  const s = p.specs;
  if (p.category === "shoes") {
    const parts = [`${p.name} memakai upper ${s["Upper"] ?? "andal"}`];
    if (s["Cushioning"]) parts.push(`cushioning ${s["Cushioning"]}`);
    if (s["Cocok untuk"]) parts.push(`dirancang untuk ${s["Cocok untuk"]}`);
    return `${parts.join(" dengan ")}.`;
  }
  const parts = [`${p.name} ditenagai ${s["Chipset"] ?? "chipset andal"}`];
  if (s["Layar"]) parts.push(`layar ${s["Layar"]}`);
  if (s["Baterai"]) parts.push(`baterai ${s["Baterai"]}`);
  return `${parts.join(", ")}.`;
}

const CATEGORY_LABEL: Record<string, string> = {
  smartphones: "Smartphones",
  laptops: "Laptops",
  shoes: "Basketball Shoes",
};

function scoreColor(score: number): string {
  if (score >= 90) return "#16a34a";
  if (score >= 80) return "#2563eb";
  if (score >= 70) return "#d97706";
  return "#dc2626";
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Sangat Baik";
  if (score >= 80) return "Baik";
  if (score >= 70) return "Cukup";
  return "Kurang";
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await ensureCatalog();
  const p = getProduct(id);
  if (!p) notFound();

  const siblings = productsByCategory(p.category);
  const idx = siblings.findIndex((x) => x.id === id);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];

  const relatedLearn = learnItems.filter((l) => l.audience.includes(p.category)).slice(0, 4);
  const relatedComparisons = comparisons.filter((c) =>
    c.products.some((cp) => findProductIdByName(cp.name) === id),
  );

  const specRows = [
    ...Object.keys(p.specs),
    ...Object.keys(p.ratings).filter((k) => !(k in p.specs)),
  ];

  return (
    <main className="section" style={{ maxWidth: 860 }}>
      <Link href={`/category/${p.category}`} className="back-btn" style={{ display: "inline-block", marginBottom: 12 }}>
        ← Kembali
      </Link>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: CATEGORY_LABEL[p.category] ?? "Produk", href: `/category/${p.category}` },
          { label: p.name },
        ]}
        title={`${p.brand} ${p.name}`}
        desc={summarize(p)}
        action={<WishlistButton productId={p.id} />}
      />

      <section className="section featured" style={{ marginTop: 0, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          {p.img ? (
            <img src={p.img} alt={p.name} style={{ width: 220, height: 220, objectFit: "contain" }} />
          ) : (
            <div
              style={{
                width: 220,
                height: 220,
                display: "grid",
                placeItems: "center",
                background: "#f1f5f9",
                borderRadius: 12,
                fontSize: 56,
              }}
            >
              📦
            </div>
          )}
          <div style={{ flex: 1, minWidth: 220 }}>
            <span style={{ display: "inline-block", fontSize: 9, fontWeight: 800, color: "#1d4ed8", background: "#dbeafe", borderRadius: 8, padding: "3px 10px", marginBottom: 8 }}>
              {CATEGORY_LABEL[p.category] ?? p.category}
            </span>
            <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>{p.name}</h2>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>{p.brand}</p>
            <div style={{ maxWidth: 280 }}>
              <ScoreBar score={p.score} label={`${p.score}/100 — ${scoreLabel(p.score)}`} />
            </div>
            <div style={{ marginTop: 12 }}>
              <Link href={`/compare?a=${p.id}`} className="view-all">Bandingkan {p.name} →</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, margin: "0 0 10px" }}>Tentang {p.name}</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.8 }}>{productBlurb(p)}</p>
        {p.affiliate && p.affiliate.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>
              Beli {p.name} di sini:
            </div>
            <BuyButtons links={p.affiliate} />
          </div>
        )}
      </section>

      {p.variants && p.variants.length > 0 ? (
        <ProductVariantSection product={p} />
      ) : (
      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, margin: "0 0 14px" }}>Spesifikasi & Skor</h2>
        <div style={{ display: "grid", gap: 0 }}>
          {specRows.map((key, i) => (
            <div key={key} style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : "none", paddingTop: i > 0 ? 10 : 0, paddingBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
                <b style={{ color: "#0f172a", minWidth: 120 }}>{key}</b>
                <span style={{ color: "#334155", textAlign: "right" }}>{p.specs[key] ?? "-"}</span>
              </div>
              {p.ratings[key] !== undefined && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                  <div style={{ flex: 1, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${p.ratings[key]}%`, height: "100%", background: scoreColor(p.ratings[key]), borderRadius: 4 }} />
                  </div>
                  <span style={{ width: 50, textAlign: "right", fontSize: 12, fontWeight: 800, color: scoreColor(p.ratings[key]) }}>{p.ratings[key]}</span>
                  <span style={{ width: 70, fontSize: 10, color: "#94a3b8", textAlign: "right" }}>{scoreLabel(p.ratings[key])}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      )}

      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, margin: "0 0 10px" }}>Kelebihan</h2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
          {p.strengths.map((s) => (
            <li key={s} style={{ marginBottom: 4 }}>{s}</li>
          ))}
        </ul>
      </section>

      {relatedLearn.length > 0 && (
        <section style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, margin: "0 0 10px" }}>Pelajari Teknologinya</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {relatedLearn.map((l) => (
              <Link key={l.slug} href={`/learn/${l.slug}`} style={{ background: "#fff", border: "1px solid #dbeafe", borderRadius: 10, padding: "8px 12px", fontSize: 11, fontWeight: 800, color: "#1d4ed8", textDecoration: "none" }}>
                {l.title} →
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedComparisons.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <div className="section-head">
            <div>
              <h2>Comparison yang memuat {p.name}</h2>
              <p>Butuh login + 2 token untuk membuka hasil.</p>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {relatedComparisons.map((c) => (
              <Link key={c.slug} href={`/compare/${c.slug}`} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 10, padding: "10px 12px", textDecoration: "none", color: "#0f172a", fontSize: 12, fontWeight: 800 }}>
                {c.products[0].name} vs {c.products[1].name} →
              </Link>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 20 }}>
        {prev ? (
          <Link href={`/product/${prev.id}`} className="view-all">← {prev.name}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/product/${next.id}`} className="view-all">{next.name} →</Link>
        ) : <span />}
      </div>
    </main>
  );
}
