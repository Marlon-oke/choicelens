"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  resolveProductVariant,
  variantSig,
  type Product,
  type VariantPicks,
} from "@/lib/data";
import VariantPills from "./VariantPills";

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

export default function ProductVariantSection({ product }: { product: Product }) {
  const groups = product.variants ?? [];
  const [picks, setPicks] = useState<VariantPicks>(() => {
    const init: VariantPicks = {};
    for (const g of groups) init[g.key] = 0;
    return init;
  });

  const resolved = useMemo(() => resolveProductVariant(product, picks), [product, picks]);

  const specRows = [
    ...Object.keys(resolved.specs),
    ...Object.keys(resolved.ratings).filter((k) => !(k in resolved.specs)),
  ];

  const sig = variantSig(picks);
  const compareHref =
    groups.length > 0 && sig
      ? `/compare?a=${product.id}&${groups.map((g) => `a_${g.key}=${picks[g.key] ?? 0}`).join("&")}`
      : `/compare?a=${product.id}`;

  return (
    <div>
      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 15, margin: "0 0 14px" }}>Pilih Varian</h2>
        <VariantPills
          groups={groups}
          picks={picks}
          onPick={(key, idx) => setPicks((p) => ({ ...p, [key]: idx }))}
        />
        <div style={{ marginTop: 12, fontSize: 11, color: "#64748b" }}>
          Skor konfigurasi ini: <b style={{ color: scoreColor(resolved.score) }}>{resolved.score}/100</b>
          {resolved.variantDesc && <> · {resolved.variantDesc}</>}
        </div>
        <div style={{ marginTop: 10 }}>
          <Link href={compareHref} className="view-all">
            Bandingkan varian ini →
          </Link>
        </div>
      </section>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 15, margin: "0 0 14px" }}>Spesifikasi & Skor</h2>
        <div style={{ display: "grid", gap: 0 }}>
          {specRows.map((key, i) => (
            <div
              key={key}
              style={{
                borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
                paddingTop: i > 0 ? 10 : 0,
                paddingBottom: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
                <b style={{ color: "#0f172a", minWidth: 120 }}>{key}</b>
                <span style={{ color: "#334155", textAlign: "right" }}>{resolved.specs[key] ?? "-"}</span>
              </div>
              {resolved.ratings[key] !== undefined && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                  <div style={{ flex: 1, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${resolved.ratings[key]}%`,
                        height: "100%",
                        background: scoreColor(resolved.ratings[key]),
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <span style={{ width: 50, textAlign: "right", fontSize: 12, fontWeight: 800, color: scoreColor(resolved.ratings[key]) }}>
                    {resolved.ratings[key]}
                  </span>
                  <span style={{ width: 70, fontSize: 10, color: "#94a3b8", textAlign: "right" }}>
                    {scoreLabel(resolved.ratings[key])}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
