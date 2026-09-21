import type { Metadata } from "next";
import Link from "next/link";
import {
  getProduct,
  productsByCategory,
  overallVerdict,
  resolveProductVariant,
  variantPicksFromParams,
} from "@/lib/data";
import { verifySession } from "@/lib/session";
import { ensureCompareAccess } from "@/lib/compare-access";
import DynamicComparison from "@/components/DynamicComparison";
import CompareVariantPicker from "@/components/CompareVariantPicker";
import PageHeader from "@/components/PageHeader";
import { ensureCatalog } from "@/lib/catalog";
import { LockedCompare, EmptyTokens, TokenReceipt, DbUnavailable, ExpiredTokens } from "@/components/CompareGate";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}): Promise<Metadata> {
  const { a = "", b = "" } = await searchParams;
  await ensureCatalog();
  const productA = getProduct(a);
  const productB = getProduct(b);

  if (!productA || !productB) {
    return {
      title: "Pilih 2 Barang Dulu — ChoiceLens",
      description: "Parameter produk belum lengkap.",
    };
  }

  return {
    title: `${productA.name} vs ${productB.name} — ChoiceLens`,
    description: `Perbandingan bebas ${productA.brand} vs ${productB.brand} dalam kategori ${productA.category}.`,
  };
}

export default async function CustomComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  await ensureCatalog();
  const a = typeof sp.a === "string" ? sp.a : "";
  const b = typeof sp.b === "string" ? sp.b : "";
  const baseA = getProduct(a);
  const baseB = getProduct(b);
  const productA = baseA ? resolveProductVariant(baseA, variantPicksFromParams(sp, "a", baseA)) : undefined;
  const productB = baseB ? resolveProductVariant(baseB, variantPicksFromParams(sp, "b", baseB)) : undefined;

  if (!productA || !productB) {
    return (
      <main className="section">
        <PageHeader
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Compare", href: "/compare" },
            { label: "Custom" },
          ]}
          title="Pilih 2 Barang Dulu"
          desc="Parameter ?a= dan ?b= belum lengkap."
        />
        <Link href="/compare" className="view-all">
          ← Kembali pilih barang
        </Link>
      </main>
    );
  }

  if (productA.id === productB.id || productA.category !== productB.category) {
    return (
      <main className="section">
        <PageHeader
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Compare", href: "/compare" },
            { label: "Custom" },
          ]}
          title="Tidak Bisa Dibandingkan"
          desc="Pilih 2 barang berbeda dalam kategori yang sama."
        />
        <Link
          href={`/compare?a=${productA.id}&b=${productB.id}`}
          className="view-all"
        >
          ← Ganti pilihan
        </Link>
      </main>
    );
  }

  const session = await verifySession();
  if (!session) {
    return (
      <main className="section">
        <PageHeader
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Compare", href: "/compare" },
            { label: `${productA.name} vs ${productB.name}` },
          ]}
          title={`${productA.name} vs ${productB.name}`}
          desc={`Info singkat: ${productA.brand} ${productA.name} (skor ${productA.score}) vs ${productB.brand} ${productB.name} (skor ${productB.score}).`}
        />
        <LockedCompare
          title={`${productA.name} vs ${productB.name}`}
          desc={`${productA.name} skor ${productA.score}/100 · ${productB.name} skor ${productB.score}/100. Tabel spek, verdict, dan range kesimpulan ada di balik kunci.`}
        />
      </main>
    );
  }

  const summary = overallVerdict(
    productA.name,
    productB.name,
    productA.score,
    productB.score,
  ).message;
  const access = await ensureCompareAccess(
    session.userId,
    "custom",
    productA.variantSig ? `${productA.id}|${productA.variantSig}` : productA.id,
    productB.variantSig ? `${productB.id}|${productB.variantSig}` : productB.id,
    summary,
    // Compare laptop: gonta-ganti varian/spec tidak memotong token,
    // cukup bayar sekali untuk pasangan produknya.
    { freeVariants: productA.category === "laptops" },
  );
  if (!access.ok) {
    const isDb = access.reason === "db";
    const isExpired = access.reason === "expired";
    return (
      <main className="section">
        <PageHeader
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Compare", href: "/compare" },
            { label: `${productA.name} vs ${productB.name}` },
          ]}
          title={`${productA.name} vs ${productB.name}`}
          desc={
            isDb
              ? "Database tidak terhubung."
              : isExpired
                ? "Masa berlaku token habis."
                : "Saldo token tidak cukup untuk membuka hasil ini."
          }
        />
        {isDb ? (
          <DbUnavailable />
        ) : isExpired ? (
          <ExpiredTokens expiresAt={access.expiresAt} />
        ) : (
          <EmptyTokens balance={access.balance} />
        )}
      </main>
    );
  }

  const others = productsByCategory(productA.category).filter(
    (p) => p.id !== productA.id && p.id !== productB.id,
  );

  return (
    <main className="section">
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Compare", href: "/compare" },
          { label: `${productA.name} vs ${productB.name}` },
        ]}
        title={`${productA.name} vs ${productB.name}`}
        desc={`Perbandingan bebas ${productA.brand} vs ${productB.brand} dalam kategori ${productA.category}.`}
        action={
          <Link
            href={`/compare?a=${productA.id}&b=${productB.id}`}
            className="view-all"
          >
            ← Ubah pilihan
          </Link>
        }
      />

      <section
        className="section featured"
        style={{ marginTop: 0, marginBottom: 20 }}
      >
        <div className="featured-label">CUSTOM COMPARISON</div>
        <div style={{ marginTop: 16 }}>
          <TokenReceipt freshCharge={access.freshCharge} balance={access.balance} expiresAt={access.expiresAt} />
          {(productA.variantDesc || productB.variantDesc) && (
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>
              Varian: {productA.name} ({productA.variantDesc || "standar"}) vs {productB.name} (
              {productB.variantDesc || "standar"})
            </div>
          )}
          {baseA && baseA.variants && baseA.variants.length > 0 && (
            <CompareVariantPicker product={baseA} prefix="a" />
          )}
          {baseB && baseB.variants && baseB.variants.length > 0 && (
            <CompareVariantPicker product={baseB} prefix="b" />
          )}
          <DynamicComparison productA={productA} productB={productB} />
        </div>
      </section>

      {others.length > 0 && (
        <div>
          <div className="section-head">
            <div>
              <h2>Coba ganti salah satu</h2>
              <p>Barang lain dalam kategori yang sama.</p>
            </div>
          </div>
          <div className="comparison-grid">
            {others.slice(0, 4).map((p) => (
              <article key={p.id} className="compare-card" style={{ textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.img}
                  alt={p.name}
                  style={{ width: "100%", height: 140, objectFit: "contain" }}
                />
                <b style={{ fontSize: 12, display: "block", marginTop: 8 }}>
                  {p.name}
                </b>
                <small style={{ fontSize: 10, color: "#64748b" }}>
                  {p.brand} · {p.score}/100
                </small>
                <div style={{ marginTop: 8 }}>
                  <Link
                    href={`/compare/custom?a=${productA.id}&b=${p.id}`}
                    prefetch={false}
                    className="view-all"
                  >
                    vs {productA.name} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}