"use client";

import Link from "next/link";
import type { Product } from "@/lib/data";
import ScoreBar from "./ScoreBar";
import WishlistButton from "./WishlistButton";

export default function ProductCard({
  product,
  slotA,
  slotB,
  onPickA,
  onPickB,
}: {
  product: Product;
  slotA: boolean;
  slotB: boolean;
  onPickA: () => void;
  onPickB: () => void;
}) {
  return (
    <article className="compare-card" style={{ textAlign: "center" }}>
      <div style={{ position: "relative" }}>
        <Link
          href={`/product/${product.id}`}
          aria-label={`Detail ${product.name}`}
          style={{ display: "block", textDecoration: "none", color: "inherit", cursor: "pointer" }}
        >
          {product.img ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.img}
              alt={product.name}
              style={{ width: "100%", height: 150, objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 150,
                display: "grid",
                placeItems: "center",
                background: "#f1f5f9",
                borderRadius: 10,
                fontSize: 32,
              }}
            >
            </div>
          )}
        </Link>
        <span style={{ position: "absolute", top: 0, left: 0 }}>
          <WishlistButton productId={product.id} />
        </span>
        {(slotA || slotB) && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "#2563eb",
              color: "#fff",
              fontSize: 9,
              fontWeight: 800,
              padding: "4px 8px",
              borderRadius: 10,
            }}
          >
            {slotA && slotB ? "A + B" : slotA ? "A" : "B"}
          </span>
        )}
      </div>
      <Link
        href={`/product/${product.id}`}
        aria-label={`Detail ${product.name}`}
        style={{ display: "block", textDecoration: "none", color: "inherit", cursor: "pointer" }}
      >
        <b style={{ fontSize: 12, display: "block", marginTop: 8 }}>
          {product.name}
        </b>
        <small style={{ fontSize: 10, color: "#64748b" }}>{product.brand}</small>
      </Link>
      <div className="scores" style={{ gridTemplateColumns: "1fr" }}>
        <ScoreBar score={product.score} label={`${product.score}/100`} />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button
          type="button"
          onClick={onPickA}
          style={{
            flex: 1,
            border: "1px solid #dbeafe",
            background: slotA ? "#2563eb" : "#eff6ff",
            color: slotA ? "#fff" : "#2563eb",
            padding: "8px 6px",
            borderRadius: 10,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          Pilih A
        </button>
        <button
          type="button"
          onClick={onPickB}
          style={{
            flex: 1,
            border: "1px solid #dbeafe",
            background: slotB ? "#2563eb" : "#eff6ff",
            color: slotB ? "#fff" : "#2563eb",
            padding: "8px 6px",
            borderRadius: 10,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          Pilih B
        </button>
      </div>
    </article>
  );
}
