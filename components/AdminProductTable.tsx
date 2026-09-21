"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/data";
import { adminDeleteProduct } from "@/lib/actions";
import AdminPhotoUpload from "./AdminPhotoUpload";

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 10,
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  padding: "8px 10px",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  fontSize: 12,
  color: "#0f172a",
  padding: "8px 10px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top",
};

const CATS = [
  { id: "semua", label: "Semua kategori" },
  { id: "smartphones", label: "HP" },
  { id: "laptops", label: "Laptop" },
  { id: "shoes", label: "Sepatu Basket" },
];

export default function AdminProductTable({ items }: { items: Product[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("semua");
  const keyword = q.trim().toLowerCase();
  const visible = items.filter((p) => {
    if (cat !== "semua" && p.category !== cat) return false;
    if (!keyword) return true;
    return (
      p.name.toLowerCase().includes(keyword) ||
      p.brand.toLowerCase().includes(keyword) ||
      p.id.toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      <form
        className="search-box"
        style={{ marginBottom: 10 }}
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <span className="search-icon">⌕</span>
        <input
          type="search"
          autoComplete="off"
          placeholder="Cari nama / brand / id..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari produk"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Hapus pencarian">
            ×
          </button>
        )}
      </form>
      <div className="pills" style={{ marginTop: 0, marginBottom: 12 }}>
        {CATS.map((c) => {
          const n = c.id === "semua" ? items.length : items.filter((p) => p.category === c.id).length;
          const on = cat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              style={
                on ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb" } : undefined
              }
            >
              {c.label} ({n})
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 10px" }}>
        Menampilkan {visible.length} dari {items.length} produk.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead>
            <tr>
              {["Produk", "Foto", "Kategori", "Skor", "Spek", "Edit", "Hapus"].map((h) => (
                <th key={h} style={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...td, textAlign: "center", color: "#64748b" }}>
                  Tidak ada produk yang cocok{q.trim() && <> dengan “{q.trim()}”</>}.
                </td>
              </tr>
            ) : (
              visible.map((p) => (
                <tr key={p.id}>
                  <td style={td}>
                    <b>{p.name}</b>
                    <br />
                    <small style={{ color: "#64748b" }}>
                      {p.brand} · {p.id}
                    </small>
                  </td>
                  <td style={{ ...td, minWidth: 190 }}>
                    {p.img ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.img}
                        alt={p.name}
                      style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 8, background: "#f8fafc", display: "block", marginBottom: 6 }}
                    />
                  ) : (
                    <div style={{ fontSize: 24, marginBottom: 6, color: "#94a3b8" }}>Image</div>
                  )}
                    <AdminPhotoUpload id={p.id} name={p.name} />
                  </td>
                  <td style={td}>{p.category}</td>
                  <td style={td}>{p.score}</td>
                  <td style={td}>
                    {Object.keys(p.specs).length} item
                    {p.variants && p.variants.length > 0 && <> · {p.variants.length} varian</>}
                    <br />
                    <small style={{ color: p.affiliate && p.affiliate.length > 0 ? "#166534" : "#94a3b8" }}>
                      {p.affiliate && p.affiliate.length > 0
                        ? `🛒 ${p.affiliate.length} affiliate`
                        : "tanpa affiliate"}
                    </small>
                  </td>
                  <td style={td}>
                    <Link
                      href={`/admin/products?edit=${p.id}`}
                      style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        border: "1px solid #bfdbfe",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 11,
                        fontWeight: 800,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Edit
                    </Link>
                  </td>
                  <td style={td}>
                    <form action={adminDeleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        style={{
                          background: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Hapus
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
