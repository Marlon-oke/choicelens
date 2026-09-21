"use client";

import type { Product } from "@/lib/data";

export default function ComparePicker({
  productA,
  productB,
  onSwap,
  onClear,
}: {
  productA?: Product;
  productB?: Product;
  onSwap: () => void;
  onClear: () => void;
}) {
  const sameCategory =
    !productA || !productB || productA.category === productB.category;
  const sameProduct =
    !!productA && !!productB && productA.id === productB.id;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #cfe0ff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center", fontSize: 12 }}>
          <div style={{ fontWeight: 800, color: "#2563eb", fontSize: 10 }}>
            SLOT A
          </div>
          <div style={{ fontWeight: 800, marginTop: 4 }}>
            {productA ? productA.name : "— Belum dipilih —"}
          </div>
          {productA && (
            <small style={{ color: "#64748b" }}>
              {productA.brand} · {productA.score}/100
            </small>
          )}
        </div>
        <span className="vs" style={{ width: 30, height: 30 }}>
          VS
        </span>
        <div style={{ textAlign: "center", fontSize: 12 }}>
          <div style={{ fontWeight: 800, color: "#2563eb", fontSize: 10 }}>
            SLOT B
          </div>
          <div style={{ fontWeight: 800, marginTop: 4 }}>
            {productB ? productB.name : "— Belum dipilih —"}
          </div>
          {productB && (
            <small style={{ color: "#64748b" }}>
              {productB.brand} · {productB.score}/100
            </small>
          )}
        </div>
      </div>

      {!sameCategory && (
        <p style={{ color: "#dc2626", fontSize: 11, marginTop: 10 }}>
          Pilih 2 produk dalam kategori yang sama.
        </p>
      )}
      {sameProduct && (
        <p style={{ color: "#dc2626", fontSize: 11, marginTop: 10 }}>
          Produk A dan B tidak boleh sama. Pilih barang yang berbeda.
        </p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onSwap}
          disabled={!productA && !productB}
          style={{
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            padding: "8px 14px",
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          ⇆ Swap
        </button>
        <button
          type="button"
          onClick={onClear}
          style={{
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            padding: "8px 14px",
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
