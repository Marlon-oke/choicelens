"use client";

import { useState } from "react";
import type { CategoryId, LearnItem } from "@/lib/data";
import LearnCard from "./LearnCard";

type FilterId = CategoryId | "all";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "smartphones", label: "HP" },
  { id: "laptops", label: "Laptop" },
  { id: "shoes", label: "Sepatu Basket" },
];

export default function LearnFilter({ items }: { items: LearnItem[] }) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [q, setQ] = useState("");

  const count = (id: FilterId) =>
    id === "all" ? items.length : items.filter((i) => i.audience.includes(id)).length;

  const keyword = q.trim().toLowerCase();
  const visible = items.filter((i) => {
    if (filter !== "all" && !i.audience.includes(filter)) return false;
    if (!keyword) return true;
    return (
      i.title.toLowerCase().includes(keyword) ||
      i.desc.toLowerCase().includes(keyword) ||
      i.example.toLowerCase().includes(keyword)
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
          placeholder="Cari materi... (misal oled, baterai, chipset)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari materi learn"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Hapus pencarian">
            ×
          </button>
        )}
      </form>
      <div className="pills" style={{ marginTop: 0, marginBottom: 12 }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            style={
              filter === f.id
                ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb" }
                : undefined
            }
          >
            {f.label} ({count(f.id)})
          </button>
        ))}
      </div>
      <div className="learn-grid">
        {visible.length === 0 ? (
          <p style={{ fontSize: 12, color: "#64748b" }}>
            Tidak ada materi yang cocok dengan “{q.trim()}”.
          </p>
        ) : (
          visible.map((item) => <LearnCard key={item.slug} item={item} />)
        )}
      </div>
    </div>
  );
}
