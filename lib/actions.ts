"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { pool, queryOne, type Row } from "./db";
import { hashPassword, verifyPassword } from "./password";
import { createSession, deleteSession, verifySession } from "./session";
import { REGISTER_BONUS, TOKEN_PRICE_RP } from "./tokens";
import { getAccount } from "./account";
import { fulfillPaidOrder } from "./orders";
import { createSnapTransaction, isMidtransConfigured } from "./midtrans";
import { getProduct } from "./data";
import { invalidateCatalog } from "./catalog";
import { generateProductDraft, type ProductDraft } from "./ai";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";

export interface ActionState {
  message?: string;
  notice?: string;
  orderId?: number;
  nota?: string;
  snapToken?: string;
  amountRp?: number;
  paidQty?: number;
  draftJson?: string;
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function signup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { message: "Nama minimal 2 karakter." };
  if (!isEmail(email)) return { message: "Email tidak valid." };
  if (password.length < 6) return { message: "Password minimal 6 karakter." };

  const exists = await queryOne<Row>(`SELECT id FROM users WHERE email = ?`, [email]);
  if (exists) return { message: "Email sudah terdaftar. Silakan login." };

  const passwordHash = await hashPassword(password);
  const conn = await pool.getConnection();
  let userId = 0;
  try {
    await conn.beginTransaction();
    const [res] = await conn.query(`INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`, [
      name,
      email,
      passwordHash,
    ]);
    userId = (res as { insertId: number }).insertId;
    await conn.query(
      `INSERT INTO wallets (user_id, balance, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 MONTH))`,
      [userId, REGISTER_BONUS],
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    if ((err as { errno?: number }).errno === 1062) {
      return { message: "Email sudah terdaftar. Silakan login." };
    }
    throw err;
  } finally {
    conn.release();
  }

  await createSession(userId);
  redirect("/dashboard");
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");

  if (!isEmail(email) || !password) return { message: "Email dan password wajib diisi." };

  const user = await queryOne<Row>(`SELECT id, password_hash FROM users WHERE email = ?`, [email]);
  if (!user) return { message: "Email atau password salah." };
  const ok = await verifyPassword(password, user.password_hash as string);
  if (!ok) return { message: "Email atau password salah." };

  await createSession(user.id as number);
  redirect(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
export async function toggleWishlist(productId: string): Promise<{ saved: boolean }> {
  const session = await verifySession();
  if (!session) throw new Error("unauthorized");
  const { ensureCatalog } = await import("./catalog");
  await ensureCatalog();
  if (!getProduct(productId)) throw new Error("unknown-product");

  const existing = await queryOne<Row>(
    `SELECT user_id FROM wishlist WHERE user_id = ? AND product_id = ?`,
    [session.userId, productId],
  );
  if (existing) {
    await pool.query(`DELETE FROM wishlist WHERE user_id = ? AND product_id = ?`, [
      session.userId,
      productId,
    ]);
    revalidatePath("/dashboard");
    return { saved: false };
  }
  await pool.query(`INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)`, [
    session.userId,
    productId,
  ]);
  revalidatePath("/dashboard");

  return { saved: true };
}

export async function removeWishlistItem(productIdOrFormData: string | FormData): Promise<void> {
  const session = await verifySession();
  if (!session) throw new Error("unauthorized");
  const { ensureCatalog } = await import("./catalog");
  await ensureCatalog();
  const productId = typeof productIdOrFormData === "string"
    ? productIdOrFormData
    : String(productIdOrFormData.get("productId") ?? "");
  const existing = await queryOne<Row>(
    `SELECT user_id FROM wishlist WHERE user_id = ? AND product_id = ?`,
    [session.userId, productId],
  );
  if (!existing) throw new Error("unknown-product");
  await pool.query(`DELETE FROM wishlist WHERE user_id = ? AND product_id = ?`, [
    session.userId,
    productId,
  ]);
  revalidatePath("/dashboard");
  revalidatePath("/wishlist");
}

export async function topupCreate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  if (!session) return { message: "Silakan login dulu." };
  const qty = Number(formData.get("qty") ?? 0);
  if (!Number.isInteger(qty) || qty < 1 || qty > 1000) {
    return { message: "Jumlah token 1–1000." };
  }
  const amountRp = qty * TOKEN_PRICE_RP;
  const now = new Date();
  const p2 = (x: number) => String(x).padStart(2, "0");
  const stamp = `${now.getFullYear()}${p2(now.getMonth() + 1)}${p2(now.getDate())}`;
  // Kode nota unik per pesanan: CL-TANGGAL-XXXX (retry kalau kebetulan sama).
  let orderId = 0;
  let nota = "";
  for (let i = 0; i < 5; i++) {
    nota = `CL-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0")}`;
    try {
      const [res] = await pool.query(
        `INSERT INTO token_orders (nota, user_id, qty, amount_rp, status) VALUES (?, ?, ?, ?, 'pending')`,
        [nota, session.userId, qty, amountRp],
      );
      orderId = (res as { insertId: number }).insertId;
      break;
    } catch (err) {
      if ((err as { errno?: number }).errno !== 1062 || i === 4) throw err;
    }
  }

  // Kalau Midtrans dikonfigurasi, buatkan transaksi Snap. Kalau gagal /
  // belum dikonfigurasi, fallback ke mode simulasi (tanpa snapToken).
  if (isMidtransConfigured()) {
    try {
      const account = await getAccount(session.userId);
      const snap = await createSnapTransaction({
        nota,
        amountRp,
        qty,
        email: account?.email ?? "",
        name: account?.name ?? "",
      });
      return { orderId, nota, amountRp, snapToken: snap.token };
    } catch (err) {
      console.error("[topup] snap gagal, fallback simulasi:", err);
    }
  }
  return { orderId, nota, amountRp };
}

export async function topupConfirm(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  if (!session) return { message: "Silakan login dulu." };
  const orderId = Number(formData.get("orderId") ?? 0);
  if (!orderId) return { message: "Order tidak valid." };

  const r = await fulfillPaidOrder(orderId, session.userId);
  if (!r.ok) return { message: "Order tidak ditemukan." };
  revalidatePath("/dashboard");
  if (r.alreadyPaid) return { message: "Order ini sudah dibayar.", paidQty: r.paidQty };
  return { paidQty: r.paidQty };
}

async function requireAdminSession(): Promise<number> {
  const session = await verifySession();
  if (!session) throw new Error("unauthorized");
  const account = await getAccount(session.userId);
  if (!account || account.role !== "admin") throw new Error("forbidden");
  return account.id;
}

export async function adminLogin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isEmail(email) || !password) return { message: "Email dan password wajib diisi." };

  const user = await queryOne<Row>(`SELECT id, password_hash, role FROM users WHERE email = ?`, [
    email,
  ]);
  if (!user) return { message: "Email atau password salah." };
  const ok = await verifyPassword(password, user.password_hash as string);
  if (!ok) return { message: "Email atau password salah." };
  if (user.role !== "admin") return { message: "Akun ini bukan admin." };

  await createSession(user.id as number);
  redirect("/admin");
}

export async function adminGrantTokens(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const adminId = await requireAdminSession();
  void adminId;
  const userId = Number(formData.get("userId") ?? 0);
  const qty = Number(formData.get("qty") ?? 0);
  if (!Number.isInteger(userId) || userId < 1) return { message: "User tidak valid." };
  if (!Number.isInteger(qty) || qty === 0 || qty < -1000 || qty > 1000) {
    return { message: "Jumlah token -1000…1000 (selain 0)." };
  }
  await pool.query(
    `INSERT INTO wallets (user_id, balance, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 MONTH))
     ON DUPLICATE KEY UPDATE balance = GREATEST(balance + VALUES(balance), 0),
       expires_at = DATE_ADD(NOW(), INTERVAL 1 MONTH)`,
    [userId, qty],
  );
  revalidatePath("/admin");
  return { paidQty: qty };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function isCategory(v: string): v is "smartphones" | "laptops" | "shoes" {
  return v === "smartphones" || v === "laptops" || v === "shoes";
}

export async function adminGenerateDraft(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  if (name.length < 2) return { message: "Nama produk minimal 2 karakter." };
  if (brand.length < 2) return { message: "Brand minimal 2 karakter." };
  if (!isCategory(category)) return { message: "Kategori tidak valid." };
  try {
    const draft: ProductDraft = await generateProductDraft({ name, brand, category });
    return { draftJson: JSON.stringify(draft) };
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Gagal generate dari AI." };
  }
}

function parseJsonRecord(raw: string, numeric: boolean): Record<string, string | number> | null {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    const out: Record<string, string | number> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (numeric) {
        const n = Number(val);
        if (!Number.isFinite(n)) return null;
        out[k] = Math.max(0, Math.min(100, Math.round(n)));
      } else {
        if (typeof val !== "string" || !val.trim()) return null;
        out[k] = val.trim();
      }
    }
    return out;
  } catch {
    return null;
  }
}

export async function adminSaveProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const img = String(formData.get("img") ?? "").trim().slice(0, 255);
  const score = Number(formData.get("score") ?? NaN);
  const keywords = String(formData.get("keywords") ?? "").trim().slice(0, 255);
  const strengths = String(formData.get("strengths") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  const specs = parseJsonRecord(String(formData.get("specsJson") ?? ""), false);
  const ratings = parseJsonRecord(String(formData.get("ratingsJson") ?? ""), true);
  const affLines = String(formData.get("affiliate") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const normUrl = (u: string): string | null => {
    const s = u.trim();
    if (/^https?:\/\/\S+$/i.test(s)) return s;
    // Tanpa protokol pun diterima, mis. "shopee.co.id/xxx".
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(s)) return `https://${s}`;
    return null;
  };
  let affSkipped = 0;
  const affiliate = affLines
    .map((line) => {
      const i = line.indexOf("|");
      // Format utama: "Toko | https://...". URL polos juga diterima,
      // label otomatis dari nama domainnya.
      let label: string;
      let rawUrl: string;
      if (i >= 0) {
        label = line.slice(0, i).trim().slice(0, 40);
        rawUrl = line.slice(i + 1).trim();
      } else {
        rawUrl = line;
        const host = rawUrl
          .replace(/^https?:\/\//i, "")
          .split("/")[0]
          .replace(/^www\./i, "");
        const first = host.split(".")[0] || "Toko";
        label = first.charAt(0).toUpperCase() + first.slice(1);
      }
      const url = normUrl(rawUrl);
      if (!label || !url) {
        affSkipped++;
        return null;
      }
      return { label, url: url.slice(0, 500) };
    })
    .filter((a): a is { label: string; url: string } => a !== null)
    .slice(0, 8);
  // Kalau user mengetik sesuatu tapi tak satu pun valid → tolak supaya tidak
  // tersimpan kosong secara diam-diam. Kosongkan textarea kalau memang mau hapus semua.
  if (affLines.length > 0 && affiliate.length === 0) {
    return {
      message:
        'Link affiliate tidak dikenali. Contoh benar: "Shopee | https://shopee.co.id/xxx" atau cukup tempel URL-nya.',
    };
  }

  if (name.length < 2) return { message: "Nama produk minimal 2 karakter." };
  if (brand.length < 2) return { message: "Brand minimal 2 karakter." };
  if (!isCategory(category)) return { message: "Kategori tidak valid." };
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return { message: "Skor harus 0–100." };
  }
  if (strengths.length === 0) return { message: "Minimal 1 kelebihan." };
  if (!specs || Object.keys(specs).length === 0) return { message: "Specs JSON tidak valid." };
  if (!ratings) return { message: "Ratings JSON tidak valid." };

  const id =
    String(formData.get("id") ?? "").trim() ||
    slugify(`${brand} ${name}`) ||
    slugify(name);

  // Foto opsional: kalau ada file baru, simpan sebagai {id}.{ext} dan pakai
  // sebagai img (menimpa teks). Hanya untuk produk yang sudah ada (id jelas).
  let finalImg = img;
  let photoReplaced = false;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const perr = photoError(photo);
    if (perr) return { message: perr };
    try {
      finalImg = await storeProductPhoto(id, category, photo);
    } catch {
      return { message: "Gagal menyimpan foto ke public/." };
    }
    photoReplaced = true;
  }
  const prev = await queryOne<Row>(
    `SELECT img, affiliate_json FROM products WHERE id = ?`,
    [id],
  );
  const oldImg = typeof prev?.img === "string" ? prev.img : "";
  // Affiliate: kalau form mengirim (tambah/edit), pakai nilai form;
  // kalau tidak dikirim (jalur lama), pertahankan yang ada.
  const affiliateSent = formData.has("affiliate");
  const affiliateJson = affiliateSent ? JSON.stringify(affiliate) : (prev?.affiliate_json as string | null) ?? null;
  await pool.query(
    `INSERT INTO products
       (id, category, name, brand, img, score, keywords, strengths_json, specs_json, ratings_json, variants_json, affiliate_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
     ON DUPLICATE KEY UPDATE
       category = VALUES(category), name = VALUES(name), brand = VALUES(brand),
       img = VALUES(img), score = VALUES(score), keywords = VALUES(keywords),
       strengths_json = VALUES(strengths_json), specs_json = VALUES(specs_json),
       ratings_json = VALUES(ratings_json), affiliate_json = VALUES(affiliate_json)`,
    [
      id,
      category,
      name,
      brand,
      finalImg,
      Math.round(score),
      keywords || `${name} ${brand}`.toLowerCase(),
      JSON.stringify(strengths),
      JSON.stringify(specs),
      JSON.stringify(ratings),
      affiliateJson,
    ],
  );
  if (photoReplaced && finalImg !== oldImg && isSafePublicPath(oldImg)) {
    await unlink(join(process.cwd(), "public", oldImg.slice(1))).catch(() => {});
  }
  invalidateCatalog();
  revalidatePath("/admin/products");
  revalidatePath("/compare");
  revalidatePath(`/product/${id}`);
  const affInfo =
    affiliate.length > 0
      ? ` (${affiliate.length} link affiliate${affSkipped > 0 ? `, ${affSkipped} baris dilewati karena format salah` : ""})`
      : affSkipped > 0
        ? ` (${affSkipped} baris affiliate dilewati — pakai format "Toko | https://...")`
        : "";
  return { notice: `✓ Produk tersimpan: ${name} (id: ${id})${affInfo}. Compare otomatis menyesuaikan.` };
}

export async function adminDeleteProduct(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await pool.query(`DELETE FROM products WHERE id = ?`, [id]);
  invalidateCatalog();
  revalidatePath("/admin/products");
  revalidatePath("/compare");
  revalidatePath(`/product/${id}`);
}

const PHOTO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

// Folder foto mengikuti kategori, sama seperti isi public/ saat ini.
const CATEGORY_FOLDERS: Record<string, string> = {
  smartphones: "smartphones",
  laptops: "Laptop",
  shoes: "basketball shoes",
};

function photoError(file: File): string | null {
  if (file.size === 0) return "Pilih file foto dulu.";
  if (file.size > 5 * 1024 * 1024) return "Foto maksimal 5 MB.";
  if (!PHOTO_EXT[file.type]) return "Format foto harus JPG/PNG/WebP/AVIF/GIF.";
  return null;
}

// Simpan foto ke public/{folder-kategori}/{id}.{ext}. Kembalikan web path.
async function storeProductPhoto(
  id: string,
  category: string,
  file: File,
): Promise<string> {
  const ext = PHOTO_EXT[file.type];
  const safeId = id.replace(/[^a-z0-9-]/g, "").slice(0, 100) || "produk";
  const folder = CATEGORY_FOLDERS[category] ?? "";
  const filename = `${safeId}.${ext}`;
  const { mkdir } = await import("node:fs/promises");
  if (folder) await mkdir(join(process.cwd(), "public", folder), { recursive: true });
  const rel = folder ? `${folder}/${filename}` : filename;
  await writeFile(join(process.cwd(), "public", rel), Buffer.from(await file.arrayBuffer()));
  return `/${rel}`;
}

function isSafePublicPath(p: string): boolean {
  return (
    p.startsWith("/") && !p.includes("..") && /^[a-z0-9][a-z0-9_.\-/ ]*$/i.test(p.slice(1))
  );
}

export async function adminUploadProductPhoto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const file = formData.get("photo");
  if (!id) return { message: "Produk tidak valid." };
  if (!(file instanceof File)) return { message: "Pilih file foto dulu." };
  const err = photoError(file);
  if (err) return { message: err };

  const prev = await queryOne<Row>(`SELECT img, category FROM products WHERE id = ?`, [id]);
  if (!prev) return { message: "Produk tidak ditemukan." };
  const oldImg = typeof prev.img === "string" ? prev.img : "";
  const category = typeof prev.category === "string" ? prev.category : "";

  let webPath: string;
  try {
    webPath = await storeProductPhoto(id, category, file);
  } catch {
    return { message: "Gagal menyimpan file foto." };
  }
  await pool.query(`UPDATE products SET img = ? WHERE id = ?`, [webPath, id]);
  if (oldImg !== webPath && isSafePublicPath(oldImg)) {
    await unlink(join(process.cwd(), "public", oldImg.slice(1))).catch(() => {});
  }
  invalidateCatalog();
  revalidatePath("/admin/products");
  revalidatePath("/compare");
  revalidatePath(`/product/${id}`);
  return { notice: `✓ Foto tersimpan: ${webPath}` };
}
