"use client";

import type { VariantGroup, VariantPicks } from "@/lib/data";

export default function VariantPills({
  groups,
  picks,
  onPick,
}: {
  groups: VariantGroup[];
  picks: VariantPicks;
  onPick: (key: string, idx: number) => void;
}) {
  if (groups.length === 0) return null;
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {groups.map((g) => {
        const active = picks[g.key] ?? 0;
        return (
          <div key={g.key}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 6 }}>
              {g.label}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {g.options.map((opt, i) => {
                const on = active === i;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onPick(g.key, i)}
                    style={{
                      border: `1px solid ${on ? "#2563eb" : "#cbd5e1"}`,
                      background: on ? "#2563eb" : "#fff",
                      color: on ? "#fff" : "#334155",
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {opt.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
