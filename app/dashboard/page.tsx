import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { getAccount, getHistory, getWishlistIds } from "@/lib/account";
import { getComparison, getProduct, parseVariantSig, resolveProductVariant } from "@/lib/data";
import { ensureCatalog } from "@/lib/catalog";
import PageHeader from "@/components/PageHeader";
import WishlistButton from "@/components/WishlistButton";

export const metadata: Metadata = {
  title: "Dashboard — ChoiceLens",
  description: "Profil, token, riwayat compare, dan wishlist kamu.",
};

function splitRef(ref: string): { id: string; sig: string } {
  const i = ref.indexOf("|");
  return i < 0 ? { id: ref, sig: "" } : { id: ref.slice(0, i), sig: ref.slice(i + 1) };
}

function variantQuery(prefix: string, sig: string): string {
  if (!sig) return "";
  return sig
    .split(",")
    .map((part) => {
      const [k, v] = part.split("=");
      return k ? `&${prefix}_${k}=${v}` : "";
    })
    .join("");
}

function historyLink(kind: string, refA: string, refB: string): { href: string; title: string } {
  if (kind === "curated") {
    const c = getComparison(refA);
    return {
      href: `/compare/${refA}`,
      title: c ? `${c.products[0].name} vs ${c.products[1].name}` : refA,
    };
  }
  const { id: idA, sig: sigA } = splitRef(refA);
  const { id: idB, sig: sigB } = splitRef(refB);
  const pa = getProduct(idA);
  const pb = getProduct(idB);
  const href = `/compare/custom?a=${idA}&b=${idB}${variantQuery("a", sigA)}${variantQuery("b", sigB)}`;
  if (!pa || !pb) return { href, title: `${idA} vs ${idB}` };
  const ra = resolveProductVariant(pa, parseVariantSig(sigA));
  const rb = resolveProductVariant(pb, parseVariantSig(sigB));
  const suffix =
    ra.variantDesc || rb.variantDesc
      ? ` (${[ra.variantDesc, rb.variantDesc].filter(Boolean).join(" | ")})`
      : "";
  return { href, title: `${pa.name} vs ${pb.name}${suffix}` };
}

export default async function DashboardPage() {
  const session = await verifySession();
  if (!session) redirect("/login?next=/dashboard");

  await ensureCatalog();
  const account = await getAccount(session.userId);
  if (!account) redirect("/login?next=/dashboard");

  const history = await getHistory(session.userId);
  const wishlistIds = await getWishlistIds(session.userId);
  const wishlist = wishlistIds
    .map((id) => getProduct(id))
    .filter((p) => p !== undefined);

  // Info masa berlaku token (1 bulan per topup, topup ulang = reset).
  let expiryText = "";
  let expiryUrgent = false;
  let expiryOver = false;
  if (!account.expiresAt) {
    expiryText = "⏳ Belum ada masa berlaku — topup 1× untuk aktif 1 bulan.";
    expiryOver = true;
  } else {
    const ms = new Date(account.expiresAt).getTime() - Date.now(); // eslint-disable-line -- waktu render server, sekali hitung
    const date = new Date(account.expiresAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (ms <= 0) {
      expiryText = `⏳ Masa berlaku habis (${date}) — topup lagi untuk reset 1 bulan.`;
      expiryOver = true;
    } else {
      const days = Math.ceil(ms / 86400000);
      expiryText = `⏳ Berlaku s.d. ${date} (sisa ${days} hari)`;
      if (days <= 7) {
        expiryText += " — topup lagi untuk reset penuh 1 bulan.";
        expiryUrgent = true;
      }
    }
  }

  return (
    <main className="section">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
        title={`Halo, ${account.name}`}
        desc={account.email}
      />

      <div style={{ display: "grid", gap: 16 }}>
        <section
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>SALDO TOKEN</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
              🎟 {account.balance}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>1 hasil compare = 2 token</div>
            <div
              style={{
                fontSize: 11,
                color: expiryOver ? "#dc2626" : expiryUrgent ? "#d97706" : "#64748b",
                fontWeight: expiryOver || expiryUrgent ? 700 : 400,
                marginTop: 4,
              }}
            >
              {expiryText}
            </div>
          </div>
          <Link
            href="/topup"
            style={{
              background: "#2563eb",
              color: "#fff",
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 12,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Topup Token →
          </Link>
        </section>

        <section
          style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}
        >
          <h2 style={{ fontSize: 14, margin: "0 0 10px" }}>♥ Wishlist ({wishlist.length})</h2>
          {wishlist.length === 0 ? (
            <p style={{ fontSize: 12, color: "#64748b" }}>
              Belum ada simpanan. Klik ♡ pada produk untuk menyimpan.
            </p>
          ) : (
            <div className="comparison-grid">
              {wishlist.map((p) => (
                <article key={p.id} className="compare-card" style={{ textAlign: "center" }}>
                  <Link
                    href={`/product/${p.id}`}
                    aria-label={`Detail ${p.name}`}
                    style={{ display: "block", textDecoration: "none", color: "inherit", cursor: "pointer" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.img}
                      alt={p.name}
                      style={{ width: "100%", height: 120, objectFit: "contain" }}
                    />
                    <span style={{ fontSize: 12, display: "block", marginTop: 8, fontWeight: 800, color: "#0f172a" }}>
                      {p.name}
                    </span>
                    <small style={{ fontSize: 10, color: "#64748b" }}>
                      {p.brand} · {p.score}/100
                    </small>
                  </Link>
                  <div
                    style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8 }}
                  >
                    <Link href="/compare" className="view-all" style={{ fontSize: 11 }}>
                      Bandingkan →
                    </Link>
                    <WishlistButton productId={p.id} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}
        >
          <h2 style={{ fontSize: 14, margin: "0 0 10px" }}>Riwayat Compare ({history.length})</h2>
          {history.length === 0 ? (
            <p style={{ fontSize: 12, color: "#64748b" }}>
              Belum ada riwayat. <Link href="/compare">Mulai bandingkan →</Link>
            </p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {history.map((h) => {
                const link = historyLink(h.kind, h.ref_a, h.ref_b);
                return (
                  <Link
                    key={h.id}
                    href={link.href}
                    prefetch={false}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      alignItems: "center",
                      border: "1px solid #f1f5f9",
                      borderRadius: 10,
                      padding: "10px 12px",
                      textDecoration: "none",
                      color: "#0f172a",
                    }}
                  >
                    <span>
                      <b style={{ fontSize: 12, display: "block" }}>{link.title}</b>
                      <small style={{ fontSize: 10, color: "#64748b" }}>
                        {h.kind === "curated" ? "Curated" : "Custom"} · {h.summary} ·{" "}
                        {new Date(h.created_at).toLocaleString("id-ID")}
                      </small>
                    </span>
                    <small style={{ fontSize: 10, fontWeight: 800, color: "#2563eb" }}>
                      −{h.cost} →
                    </small>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
