import Link from "next/link";
import { ensureCatalog } from "@/lib/catalog";
import { getWishlistIds } from "@/lib/account";
import { verifySession } from "@/lib/session";
import { invalidateCatalog } from "@/lib/catalog";
import { removeWishlistItem } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await verifySession();
  if (!session) {
    return (
      <section className="py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold">Wishlist</h1>
        <p className="mb-6 text-gray-500">Silakan masuk dulu untuk melihat wishlist.</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white"
        >
          Masuk
        </Link>
      </section>
    );
  }

  let wishlistIds: string[] = [];
  try {
    wishlistIds = await getWishlistIds(session.userId);
  } catch {
    wishlistIds = [];
  }

  invalidateCatalog();
  const catalog = await ensureCatalog();
  const wishlistProducts = catalog.filter((p) => wishlistIds.includes(p.id));

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Wishlist</h1>
      {wishlistIds.length === 0 ? (
        <p className="text-center py-12 text-gray-500">
          Wishlist kamu masih kosong. Simpan produk dengan menekan tombol ♥ di
          kartu produk.
        </p>
      ) : (
        <div className="wishlist-grid">
          {wishlistProducts.map((product) => (
            <article
              key={product.id}
              className="compare-card"
              style={{ textAlign: "center", position: "relative" }}
            >
              <Link
                href={`/product/${product.id}`}
                style={{ display: "block", textDecoration: "none", color: "inherit" }}
              >
                {product.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
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
                    }}
                  />
                )}
              </Link>
              <Link
                href={`/product/${product.id}`}
                style={{ display: "block", textDecoration: "none", color: "inherit" }}
              >
                <b style={{ fontSize: 12, display: "block", marginTop: 8 }}>
                  {product.name}
                </b>
                <small style={{ fontSize: 10, color: "#64748b" }}>
                  {product.brand}
                </small>
              </Link>
              <form action={removeWishlistItem} style={{ marginTop: 8 }}>
                <input type="hidden" name="productId" value={product.id} />
                <button
                  type="submit"
                  style={{
                    border: "1px solid #fecaca",
                    background: "#fff5f5",
                    color: "#dc2626",
                    borderRadius: 10,
                    padding: "6px 10px",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Hapus
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}