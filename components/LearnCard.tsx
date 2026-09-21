import Link from "next/link";
import type { LearnItem } from "@/lib/data";

export default function LearnCard({ item }: { item: LearnItem }) {
  return (
    <article className="learn-card" style={{ cursor: "pointer" }}>
      <Link
        href={`/learn/${item.slug}`}
        aria-label={`Pelajari ${item.title}`}
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
        <div className="learn-body">
          <div>
            <span
              style={{
                display: "inline-block",
                fontSize: 8,
                fontWeight: 800,
                color: "#1d4ed8",
                background: "#dbeafe",
                borderRadius: 8,
                padding: "2px 8px",
                marginBottom: 4,
              }}
            >
              {item.kind}
            </span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <p style={{ fontSize: 9, color: "#1d4ed8", fontWeight: 700, margin: "4px 0 8px" }}>
              {item.example}
            </p>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#2563eb" }}>Explain →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
