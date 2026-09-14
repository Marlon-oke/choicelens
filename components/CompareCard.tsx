import type { CSSProperties } from "react";
import type { Comparison } from "@/lib/data";

export default function CompareCard({
  comparison,
  onPlaceholder,
}: {
  comparison: Comparison;
  onPlaceholder: () => void;
}) {
  const [a, b] = comparison.products;
  return (
    <article className="compare-card">
      <div className="versus-row">
        <div className="compare-product">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="compare-product-img" src={a.img} alt={a.name} />
          <b>{a.name}</b>
          <small>{a.brand}</small>
        </div>
        <span className="vs">VS</span>
        <div className="compare-product">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="compare-product-img" src={b.img} alt={b.name} />
          <b>{b.name}</b>
          <small>{b.brand}</small>
        </div>
      </div>
      <div className="scores">
        <span>
          {a.score}/100{" "}
          <i style={{ "--score": `${a.score}%` } as CSSProperties}></i>
        </span>
        <span>
          {b.score}/100{" "}
          <i style={{ "--score": `${b.score}%` } as CSSProperties}></i>
        </span>
      </div>
      <a
        href="#"
        className="card-link"
        onClick={(e) => {
          e.preventDefault();
          onPlaceholder();
        }}
      >
        View Comparison →
      </a>
    </article>
  );
}
