import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  products,
  getProduct,
  productsByCategory,
  comparisons,
  findProductIdByName,
  learnItems,
  type Product,
} from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import ScoreBar from "@/components/ScoreBar";
import WishlistButton from "@/components/WishlistButton";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
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

const CATEGORY_NOUN: Record<string, string> = {
  smartphones: "HP",
  laptops: "laptop",
  shoes: "sepatu",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  return (
    <main className="section" style={{ maxWidth: 800 }}>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Produk", href: `/category/${p.category}` },
          { label: p.name },
        ]}
        title={`${p.brand} ${p.name}`}
        desc={summarize(p)}
        action={<WishlistButton productId={p.id} />}
      />

      <section
        className="section featured"
        style={{ marginTop: 0, marginBottom: 20 }}
      >
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.img}
            alt={p.name}
            style={{ width: 220, height: 220, objectFit: "contain" }}
          />
          <div style={{ flex: 1, minWidth: 220 }}>
            <span
              style={{
                display: "inline-block",
                fontSize: 9,
                fontWeight: 800,
                color: "#1d4ed8",
                background: "#dbeafe",
                borderRadius: 8,
                padding: "3px 10px",
                marginBottom: 8,
              }}
            >
              {CATEGORY_LABEL[p.category] ?? p.category}
            </span>
            <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>{p.name}</h2>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>
              {p.brand}
            </p>
            <div style={{ maxWidth: 280 }}>
              <ScoreBar score={p.score} label={`${p.score}/100`} />
            </div>
            <div style={{ marginTop: 12 }}>
              <Link href={`/compare?a=${p.id}`} className="view-all">
                Bandingkan {CATEGORY_NOUN[p.category] ?? "produk"} ini →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}
      >
        <h2 style={{ fontSize: 15, margin: "0 0 10px" }}>Spesifikasi utama</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {Object.entries(p.specs).map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 12,
                borderTop: "1px solid #f1f5f9",
                paddingTop: 8,
              }}
            >
              <b style={{ color: "#0f172a" }}>{label}</b>
              <span style={{ color: "#334155", textAlign: "right" }}>{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 20,
          marginTop: 16,
        }}
      >
        <h2 style={{ fontSize: 15, margin: "0 0 10px" }}>Cocok untuk kamu jika…</h2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
          {p.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      {relatedLearn.length > 0 && (
        <section
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 12,
            padding: 20,
            marginTop: 16,
          }}
        >
          <h2 style={{ fontSize: 15, margin: "0 0 10px" }}>Pelajari teknologinya</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {relatedLearn.map((l) => (
              <Link
                key={l.slug}
                href={`/learn/${l.slug}`}
                style={{
                  background: "#fff",
                  border: "1px solid #dbeafe",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#1d4ed8",
                  textDecoration: "none",
                }}
              >
                {l.icon} {l.title} →
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedComparisons.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <div className="section-head">
            <div>
              <h2>Comparison yang memuat {p.name}</h2>
              <p>Butuh login + 2 token untuk membuka hasil.</p>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {relatedComparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  borderRadius: 10,
                  padding: "10px 12px",
                  textDecoration: "none",
                  color: "#0f172a",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {c.products[0].name} vs {c.products[1].name} →
              </Link>
            ))}
          </div>
        </section>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 20,
        }}
      >
        {prev ? (
          <Link href={`/product/${prev.id}`} className="view-all">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/product/${next.id}`} className="view-all">
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
