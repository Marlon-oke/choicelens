"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  categoryIds,
  categoriesMeta,
  learnItems,
  type CategoryId,
  type Comparison,
  type Product,
} from "@/lib/data";
import ProductCard from "./ProductCard";
import ComparePicker from "./ComparePicker";
import CompareCard from "./CompareCard";

export default function CompareStudio({
  allProducts,
  popular,
}: {
  allProducts: Product[];
  popular: Comparison[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const urlQ = params.get("q") ?? "";
  const [draft, setDraft] = useState(urlQ);
  const [lastQ, setLastQ] = useState(urlQ);
  // Sinkron dari URL (mis. search navbar) tanpa effect: pola render-time
  // yang direkomendasikan React untuk derived state.
  if (urlQ !== lastQ) {
    setLastQ(urlQ);
    setDraft(urlQ);
  }

  const cat = params.get("category") ?? "";
  const idA = params.get("a") ?? "";
  const idB = params.get("b") ?? "";

  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    router.push(`/compare?${next.toString()}`);
  };

  const pick = (id: string, slot: "a" | "b") => {
    if (slot === "a") {
      setParams({ a: idA === id ? null : id });
    } else {
      setParams({ b: idB === id ? null : id });
    }
  };

  const visible = useMemo(() => {
    const keyword = draft.trim().toLowerCase();
    return allProducts.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (!keyword) return true;
      return (
        p.keywords.includes(keyword) ||
        p.name.toLowerCase().includes(keyword) ||
        p.brand.toLowerCase().includes(keyword)
      );
    });
  }, [allProducts, draft, cat]);

  const matchedLearn = useMemo(() => {
    const keyword = draft.trim().toLowerCase();
    if (!keyword) return [];
    return learnItems.filter(
      (l) =>
        l.title.toLowerCase().includes(keyword) ||
        l.desc.toLowerCase().includes(keyword),
    );
  }, [draft]);

  const productA = allProducts.find((p) => p.id === idA);
  const productB = allProducts.find((p) => p.id === idB);

  // Teruskan pilihan varian (param a_*/b_*) ke halaman penuh, dan saat swap
  // ikut tukar variannya supaya tidak tertukar antar sisi.
  const variantParams = (prefix: "a" | "b"): string[] => {
    const out: string[] = [];
    params.forEach((v, k) => {
      if (k.startsWith(`${prefix}_`)) out.push(`${k}=${encodeURIComponent(v)}`);
    });
    return out;
  };

  const customHref =
    productA && productB
      ? `/compare/custom?a=${productA.id}&b=${productB.id}${[...variantParams("a"), ...variantParams("b")].map((s) => `&${s}`).join("")}`
      : null;

  const swapParams = () => {
    const patch: Record<string, string | null> = { a: idB || null, b: idA || null };
    const aVars: Array<[string, string]> = [];
    const bVars: Array<[string, string]> = [];
    params.forEach((v, k) => {
      if (k.startsWith("a_")) aVars.push([k.slice(2), v]);
      else if (k.startsWith("b_")) bVars.push([k.slice(2), v]);
    });
    for (const [k] of aVars) patch[`a_${k}`] = null;
    for (const [k] of bVars) patch[`b_${k}`] = null;
    for (const [k, v] of aVars) patch[`b_${k}`] = v;
    for (const [k, v] of bVars) patch[`a_${k}`] = v;
    setParams(patch);
  };

  const clearParams = () => {
    const patch: Record<string, string | null> = { a: null, b: null };
    params.forEach((_v, k) => {
      if (k.startsWith("a_") || k.startsWith("b_")) patch[k] = null;
    });
    setParams(patch);
  };
  const liveReady =
    !!productA &&
    !!productB &&
    productA.id !== productB.id &&
    productA.category === productB.category;



  return (
    <div>
      <ComparePicker
        productA={productA}
        productB={productB}
        onSwap={swapParams}
        onClear={clearParams}
      />

      {liveReady && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Link
              href={customHref ?? `/compare/custom?a=${productA!.id}&b=${productB!.id}`}
              prefetch={false}
              style={{
                display: "inline-block",
                background: "#2563eb",
                color: "#fff",
                padding: "12px 32px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Bandingkan →
            </Link>
        </div>
      )}

      <form
        className="search-box"
        style={{ marginBottom: 12 }}
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <span className="search-icon">⌕</span>
        <input
          type="search"
          autoComplete="off"
          placeholder="Cari barang satuan... (misal iphone, thinkpad, nike)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Cari barang"
        />
        {draft && (
          <button type="button" onClick={() => setDraft("")} aria-label="Hapus pencarian">
            ×
          </button>
        )}
      </form>

      <div className="pills" style={{ marginTop: 0, marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setParams({ category: null })}
          style={
            !cat
              ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb" }
              : undefined
          }
        >
          All ({allProducts.length})
        </button>
        {categoryIds.map((id: CategoryId) => (
          <button
            key={id}
            type="button"
            onClick={() => setParams({ category: cat === id ? null : id })}
            style={
              cat === id
                ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb" }
                : undefined
            }
          >
            {categoriesMeta[id].icon} {categoriesMeta[id].name}
          </button>
        ))}
      </div>

      {matchedLearn.length > 0 && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 12,
            padding: "12px 14px",
            margin: "10px 0 14px",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: "#1e40af", marginBottom: 8 }}>
            📘 Materi terkait “{draft.trim()}”
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {matchedLearn.map((l) => (
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
                {l.title} →
              </Link>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: "#64748b", margin: "10px 0 14px" }}>
        Pilih 2 barang satuan dengan merek bebas, lalu klik Bandingkan. Menampilkan {visible.length} dari{" "}
        {allProducts.length} barang.
      </p>

      {visible.length === 0 ? (
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
          Tidak ada barang yang cocok. Coba kata kunci lain.
        </div>
      ) : (
        <div className="comparison-grid">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              slotA={idA === p.id}
              slotB={idB === p.id}
              onPickA={() => pick(p.id, "a")}
              onPickB={() => pick(p.id, "b")}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <div className="section-head">
          <div>
            <h2>Popular Comparisons</h2>
            <p>Perbandingan curated pilihan editor.</p>
          </div>
        </div>
        <div className="comparison-grid">
          {popular.map((c) => (
            <CompareCard key={c.slug} comparison={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
