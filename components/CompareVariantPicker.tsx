"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Product, VariantPicks } from "@/lib/data";
import VariantPills from "./VariantPills";

export default function CompareVariantPicker({
  product,
  prefix,
}: {
  product: Product;
  prefix: "a" | "b";
}) {
  const groups = product.variants ?? [];
  const params = useSearchParams();
  const router = useRouter();
  if (groups.length === 0) return null;

  const picks: VariantPicks = {};
  for (const g of groups) {
    const n = Number(params.get(`${prefix}_${g.key}`));
    picks[g.key] = Number.isInteger(n) && n >= 0 && n < g.options.length ? n : 0;
  }

  const onPick = (key: string, idx: number) => {
    const next = new URLSearchParams(params.toString());
    next.set(`${prefix}_${key}`, String(idx));
    router.push(`/compare/custom?${next.toString()}`);
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 10 }}>
        VARIAN — {product.name}
      </div>
      <VariantPills groups={groups} picks={picks} onPick={onPick} />
    </div>
  );
}
