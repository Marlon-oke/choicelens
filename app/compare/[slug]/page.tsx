import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  comparisons,
  getComparison,
  comparisonsByCategory,
  buildVerdict,
  overallVerdict,
  findProductIdByName,
  getProduct,
  productBlurb,
} from "@/lib/data";
import { verifySession } from "@/lib/session";
import { ensureCompareAccess } from "@/lib/compare-access";
import SpecTable from "@/components/SpecTable";
import WishlistButton from "@/components/WishlistButton";
import BuyButtons from "@/components/BuyButtons";
import CompareCard from "@/components/CompareCard";
import PageHeader from "@/components/PageHeader";
import VerdictMeter from "@/components/VerdictMeter";
import { LockedCompare, EmptyTokens, TokenReceipt, DbUnavailable, ExpiredTokens } from "@/components/CompareGate";
import { ensureCatalog } from "@/lib/catalog";

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) return { title: "Comparison tidak ditemukan — ChoiceLens" };
  return {
    title: `${c.products[0].name} vs ${c.products[1].name} — ChoiceLens`,
    description: c.tagline,
  };
}

export default async function CompareDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await ensureCatalog();
  const c = getComparison(slug);
  if (!c) notFound();

  const [a, b] = c.products;
  const verdict = buildVerdict(
    a.name,
    b.name,
    c.specs,
  );

  const session = await verifySession();
  if (!session) {
    return (
      <main className="section">
        <PageHeader
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Compare", href: "/compare" },
            { label: `${a.name} vs ${b.name}` },
          ]}
          title={`${a.name} vs ${b.name}`}
          desc={`Info singkat: ${a.brand} ${a.name} (skor ${a.score}) vs ${b.brand} ${b.name} (skor ${b.score}). ${c.tagline}`}
        />
        <LockedCompare
          title={`${a.name} vs ${b.name}`}
          desc="Tabel spek, verdict, dan range kesimpulan ada di balik kunci."
        />
      </main>
    );
  }

  const summary = overallVerdict(a.name, b.name, a.score, b.score).message;
  const access = await ensureCompareAccess(session.userId, "curated", c.slug, "", summary);
  if (!access.ok) {
    const isDb = access.reason === "db";
    const isExpired = access.reason === "expired";
    return (
      <main className="section">
        <PageHeader
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Compare", href: "/compare" },
            { label: `${a.name} vs ${b.name}` },
          ]}
          title={`${a.name} vs ${b.name}`}
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

  const related = comparisonsByCategory(c.category).filter(
    (r) => r.slug !== c.slug,
  );

  const fullA = (() => { const id = findProductIdByName(a.name); return id ? getProduct(id) : undefined; })();
  const fullB = (() => { const id = findProductIdByName(b.name); return id ? getProduct(id) : undefined; })();

  return (
    <main className="section">
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Compare", href: "/compare" },
          { label: `${a.name} vs ${b.name}` },
        ]}
        title={`${a.name} vs ${b.name}`}
        desc={c.tagline}
        action={
          <Link href="/compare" className="view-all">
            ← Semua
          </Link>
        }
      />

      <TokenReceipt freshCharge={access.freshCharge} balance={access.balance} expiresAt={access.expiresAt} />

      <section className="section featured" style={{ marginTop: 0 }}>
        <div className="featured-label">FEATURED COMPARISON</div>
        <div className="featured-grid" style={{ marginTop: 16 }}>
          <div className="featured-products">
            <div className="featured-product">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.img}
                alt={a.name}
                style={{ width: "100%", height: 180, objectFit: "contain" }}
              />
              <h3>{a.name}</h3>
              <small>{a.brand}</small>
              <strong>{a.score}/100</strong>
              <label>ChoiceLens Score</label>
              {fullA && (
                <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.7, margin: "8px 0 0" }}>
                  {productBlurb(fullA)}
                </p>
              )}
              {fullA?.affiliate && <BuyButtons links={fullA.affiliate} />}
              {findProductIdByName(a.name) && (
                <div style={{ marginTop: 8 }}>
                  <WishlistButton productId={findProductIdByName(a.name) as string} />
                </div>
              )}
            </div>
            <div className="big-vs">VS</div>
            <div className="featured-product">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.img}
                alt={b.name}
                style={{ width: "100%", height: 180, objectFit: "contain" }}
              />
              <h3>{b.name}</h3>
              <small>{b.brand}</small>
              <strong>{b.score}/100</strong>
              <label>ChoiceLens Score</label>
              {fullB && (
                <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.7, margin: "8px 0 0" }}>
                  {productBlurb(fullB)}
                </p>
              )}
              {fullB?.affiliate && <BuyButtons links={fullB.affiliate} />}
              {findProductIdByName(b.name) && (
                <div style={{ marginTop: 8 }}>
                  <WishlistButton productId={findProductIdByName(b.name) as string} />
                </div>
              )}
            </div>
          </div>

          {/* Section verdict + range meter */}
          <div style={{ marginTop: 12 }}>
            <VerdictMeter
              nameA={a.name}
              nameB={b.name}
              menang={verdict.menang}
              seri={verdict.seri}
              kalah={verdict.kalah}
              total={verdict.totalSpecs}
              scoreA={a.score}
              scoreB={b.score}
            />
          </div>
        </div>
      </section>

      <div style={{ marginTop: 20 }}>
        <h2
          style={{
            fontSize: 18,
            letterSpacing: -0.4,
            margin: "0 0 10px",
            fontFamily: "var(--font-manrope), Manrope, sans-serif",
          }}
        >
          Tabel Spesifikasi
        </h2>
        <SpecTable specs={c.specs ?? []} nameA={a.name} nameB={b.name} />
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="section-head">
            <div>
              <h2>Related di {c.category}</h2>
              <p>Perbandingan lain dalam kategori yang sama.</p>
            </div>
            <Link href={`/category/${c.category}`} className="view-all">
              Lihat kategori →
            </Link>
          </div>
          <div className="comparison-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {related.slice(0, 3).map((r) => (
              <CompareCard key={r.slug} comparison={r} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}