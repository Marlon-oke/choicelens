"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/lib/actions";

export default function WishlistButton({ productId }: { productId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`)
      .then((r) => (r.ok ? r.json() : { saved: false }))
      .then((d) => {
        if (alive) setSaved(!!d.saved);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [productId]);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await toggleWishlist(productId);
      setSaved(res.saved);
    } catch {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={saved ? "Hapus dari wishlist" : "Simpan ke wishlist"}
      title={saved ? "Tersimpan ♥" : "Simpan ke wishlist"}
      style={{
        border: "1px solid #e2e8f0",
        background: saved ? "#fee2e2" : "#fff",
        color: saved ? "#dc2626" : "#94a3b8",
        borderRadius: 10,
        padding: "6px 10px",
        fontSize: 13,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}
