import { query, queryOne, type Row } from "./db";

export interface Account {
  id: number;
  name: string;
  email: string;
  balance: number;
  role: "user" | "admin";
  expiresAt: string | null;
}

export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
}

export async function getAccount(userId: number): Promise<Account | null> {
  try {
    const row = await queryOne<Row>(
      `SELECT u.id, u.name, u.email, u.role, COALESCE(w.balance, 0) AS balance, w.expires_at
       FROM users u LEFT JOIN wallets w ON w.user_id = u.id
       WHERE u.id = ?`,
      [userId],
    );
    if (!row) return null;
    return {
      id: row.id as number,
      name: row.name as string,
      email: row.email as string,
      balance: Number(row.balance ?? 0),
      role: row.role === "admin" ? "admin" : "user",
      expiresAt: row.expires_at ? String(row.expires_at) : null,
    };
  } catch (err) {
    // DB lama yang belum migrasi (belum ada kolom users.role, error 1054):
    // baca tanpa role supaya halaman tidak crash, anggap user biasa.
    if ((err as { errno?: number }).errno !== 1054) throw err;
    const row = await queryOne<Row>(
      `SELECT u.id, u.name, u.email, COALESCE(w.balance, 0) AS balance
       FROM users u LEFT JOIN wallets w ON w.user_id = u.id
       WHERE u.id = ?`,
      [userId],
    );
    if (!row) return null;
    return {
      id: row.id as number,
      name: row.name as string,
      email: row.email as string,
      balance: Number(row.balance ?? 0),
      role: "user",
      expiresAt: null,
    };
  }
}

export interface HistoryItem {
  id: number;
  kind: "curated" | "custom";
  ref_a: string;
  ref_b: string;
  summary: string;
  cost: number;
  created_at: string;
}

export async function getHistory(userId: number, limit = 20): Promise<HistoryItem[]> {
  const rows = await query<Row>(
    `SELECT id, kind, ref_a, ref_b, summary, cost, created_at
     FROM compare_history WHERE user_id = ? ORDER BY id DESC LIMIT ?`,
    [userId, limit],
  );
  return rows.map((r) => ({
    id: r.id as number,
    kind: r.kind as "curated" | "custom",
    ref_a: r.ref_a as string,
    ref_b: r.ref_b as string,
    summary: (r.summary as string) ?? "",
    cost: Number(r.cost ?? 0),
    created_at: String(r.created_at ?? ""),
  }));
}

export async function getWishlistIds(userId: number): Promise<string[]> {
  const rows = await query<Row>(`SELECT product_id FROM wishlist WHERE user_id = ? ORDER BY created_at DESC`, [
    userId,
  ]);
  return rows.map((r) => r.product_id as string);
}
