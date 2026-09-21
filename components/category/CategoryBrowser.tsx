"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/data";
import ScoreBar from "../ScoreBar";
import WishlistButton from "../WishlistButton";

export default function CategoryBrowser({
  products,
}: {
  products: Product[];
}) {
  const [q, setQ] = useState("");

  const keyword = q.trim().toLowerCase();
  const visible = products.filter((p) => {
    if (!keyword) return true;
    return (
      p.name.toLowerCase().includes(keyword) ||
      p.brand.toLowerCase().includes(keyword) ||
      p.keywords.includes(keyword)
    );
  });

  return (
    <div>
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
          placeholder="Cari barang... (misal iphone, thinkpad, nike)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari barang"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Hapus pencarian">
            ×
          </button>
        )}
      </form>

      {(q.trim()) && (
        <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 12px" }}>
          Menampilkan {visible.length} dari {products.length} barang.
          {(q.trim()) && (
            <button
              type="button"
              onClick={() => {
                setQ("");
              }}
              style={{
                marginLeft: 8,
                background: "none",
                border: 0,
                color: "#2563eb",
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Reset
            </button>
          )}
        </p>
      )}

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
          Tidak ada produk yang cocok{q.trim() && <> dengan “{q.trim()}”</>}.
        </div>
      ) : (
        <>
          <div className="comparison-grid">
            {visible.map((p) => (
              <article key={p.id} className="compare-card" style={{ textAlign: "center" }}>
                <div style={{ position: "relative" }}>
                  <Link
                    href={`/product/${p.id}`}
                    aria-label={`Detail ${p.name}`}
                    style={{ display: "block", textDecoration: "none", color: "inherit", cursor: "pointer" }}
                  >
                    {p.img ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.img}
                        alt={p.name}
                        style={{ width: "100%", height: 150, objectFit: "contain" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: 150,
                          display: "grid",
                          placeItems: "center",
                          background: "#f1f5f9",
                      borderRadius: 10,
                      fontSize: 32,
                      color: "#94a3b8",
                    }}
                  >
                    Image
                  </div>
                )}
                  </Link>
                  <span style={{ position: "absolute", top: 0, left: 0 }}>
                    <WishlistButton productId={p.id} />
                  </span>
                </div>
                <Link
                  href={`/product/${p.id}`}
                  aria-label={`Detail ${p.name}`}
                  style={{ display: "block", textDecoration: "none", color: "inherit", cursor: "pointer" }}
                >
                  <span style={{ fontSize: 12, display: "block", marginTop: 8, fontWeight: 800, color: "#0f172a" }}>
                    {p.name}
                  </span>
                  <small style={{ fontSize: 10, color: "#64748b" }}>{p.brand}</small>
                </Link>
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
    </div>
  );
}
