import type { AffiliateLink } from "@/lib/data";

export default function BuyButtons({ links }: { links?: AffiliateLink[] }) {
  if (!links || links.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
      {links.map((a) => (
        <a
          key={`$🛒 {a.label}-${a.url}`}
          href={a.url}
          target="_blank"
          rel="nofollow sponsored noopener"
          style={{
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            borderRadius: 10,
            padding: "9px 16px",
            fontSize: 12,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 6px 14px rgba(37, 99, 235, 0.3)",
          }}
        >
          {a.label}
        </a>
      ))}
    </div>
  );
}
