import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Pencarian — ChoiceLens",
  description: "Cari barang, materi, dan comparison.",
};

export default function SearchPage() {
  return (
    <main className="section">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
        title="Pencarian"
        desc="Gunakan kotak pencarian di navigasi untuk mencari barang, materi, atau comparison."
      />

      <div style={{ textAlign: "center", padding: 40 }}>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
          Fitur pencarian memerlukan server. Contoh pencarian:
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/search?q=iphone" style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", background: "#dbeafe", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 12px", textDecoration: "none" }}>
            iphone
          </Link>
          <Link href="/search?q=oled" style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", background: "#dbeafe", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 12px", textDecoration: "none" }}>
            oled
          </Link>
          <Link href="/search?q=ryzen" style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", background: "#dbeafe", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 12px", textDecoration: "none" }}>
            ryzen
          </Link>
        </div>
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 16 }}>
          (Pencarian dinamis tidak tersedia pada versi statis)
        </p>
      </div>
    </main>
  );
}