import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { learnItems, getLearnItem } from "@/lib/data";
import PageHeader from "@/components/PageHeader";

export function generateStaticParams() {
  return learnItems.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getLearnItem(slug);
  if (!item) return { title: "Materi tidak ditemukan — ChoiceLens" };
  return { title: `${item.title} — ChoiceLens Learn`, description: item.desc };
}

export default async function LearnDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getLearnItem(slug);
  if (!item) notFound();

  const idx = learnItems.findIndex((i) => i.slug === slug);
  const prev = learnItems[idx - 1];
  const next = learnItems[idx + 1];

  return (
    <main className="section" style={{ maxWidth: 800 }}>
      <Link href="/learn" className="back-btn" style={{ display: "inline-block", marginBottom: 12 }}>
        ← Kembali
      </Link>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Learn", href: "/learn" },
          { label: item.title },
        ]}
        title={`${item.title}`}
        desc={item.desc}
      />

      <div style={{ display: "grid", gap: 14 }}>
        {(item.chapters ?? []).map((ch, i) => (
          <article
            key={ch.heading}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#2563eb",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              CHAPTER {i + 1}
            </div>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: 17,
                letterSpacing: -0.3,
                fontFamily: "var(--font-manrope), Manrope, sans-serif",
              }}
            >
              {ch.heading}
            </h2>
            <p
              style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#475569" }}
            >
              {ch.body}
            </p>
          </article>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 20,
        }}
      >
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="view-all">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/learn/${next.slug}`} className="view-all">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
