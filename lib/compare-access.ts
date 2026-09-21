import { pool, queryOne, type Row } from "./db";
import { COMPARE_COST } from "./tokens";

export type CompareKind = "curated" | "custom";

export interface CompareAccess {
  ok: boolean;
  freshCharge: boolean;
  balance: number;
  reason?: "empty" | "db" | "expired";
  expiresAt?: string | null;
}

export interface CompareAccessOptions {
  // Kalau true (dipakai untuk compare laptop): pilihan varian/spec (sufiks
  // "|..." pada ref) diabaikan untuk urusan token — gonta-ganti varian tidak
  // memotong token, cukup bayar sekali untuk pasangan produknya.
  freeVariants?: boolean;
}

function isDbConnectionError(err: unknown): boolean {
  const code = (err as { code?: unknown })?.code;
  return (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "PROTOCOL_CONNECTION_LOST" ||
    (err as { name?: unknown })?.name === "AggregateError"
  );
}

// Normalisasi kunci pasangan: A-vs-B dianggap sama dengan B-vs-A,
// supaya tidak double-charge dan gratis-ulang berlaku dua arah.
export function normalizeCompareRefs(
  kind: CompareKind,
  refA: string,
  refB: string,
): [string, string] {
  if (kind === "custom") {
    const [x, y] = [refA, refB].sort();
    return [x, y];
  }
  return [refA, refB];
}

async function readBalance(userId: number): Promise<number> {
  const w = await queryOne<Row>(`SELECT balance FROM wallets WHERE user_id = ?`, [userId]);
  return Number(w?.balance ?? 0);
}

async function readWallet(
  userId: number,
): Promise<{ balance: number; expiresAt: string | null }> {
  let w: Row | null = null;
  try {
    w = await queryOne<Row>(`SELECT balance, expires_at FROM wallets WHERE user_id = ?`, [userId]);
  } catch (err) {
    // DB belum migrasi (tanpa expires_at): anggap tidak ada masa berlaku.
    if ((err as { errno?: number }).errno !== 1054) throw err;
    w = await queryOne<Row>(`SELECT balance FROM wallets WHERE user_id = ?`, [userId]);
  }
  return {
    balance: Number(w?.balance ?? 0),
    expiresAt: (w as Row | null)?.expires_at ? String((w as Row).expires_at) : null,
  };
}

function expired(expiresAt: string | null): boolean {
  // NULL = belum pernah topup di sistem baru → dianggap kedaluwarsa.
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
}

// Buka akses hasil compare: bayar COMPARE_COST token hanya untuk pasangan
// yang belum pernah dibuka user (idempotent per user+kind+ref yang
// dinormalisasi); buka ulang pasangan yang sama gratis.
// Jika DB tidak terjangkau, kembalikan reason "db" agar halaman bisa
// menampilkan pesan ramah alih-alih crash (mis. AggregateError ECONNREFUSED
// dari mysql2 yang dulunya muncul sebagai "object null is not iterable").
export async function ensureCompareAccess(
  userId: number,
  kind: CompareKind,
  refA: string,
  refB: string,
  summary: string,
  opts?: CompareAccessOptions,
): Promise<CompareAccess> {
  // Mode freeVariants: buang sufiks varian ("id|sig" → "id") supaya semua
  // konfigurasi varian pasangan yang sama memakai satu kunci token.
  const strip = (s: string): string =>
    opts?.freeVariants && kind === "custom" ? s.split("|")[0] : s;
  const [nA, nB] = normalizeCompareRefs(kind, strip(refA), strip(refB));
  try {
    // Untuk custom, cek dua urutan sekaligus: baris lama (sebelum normalisasi)
    // mungkin tersimpan terbalik (B-vs-A) atau masih membawa sufiks varian
    // ("id|sig" dari sebelum mode freeVariants). Kalau ketemu, migrasikan ke
    // bentuk normal supaya kunjungan berikut gratis dua arah.
    const seen = await queryOne<Row>(
      kind === "custom"
        ? `SELECT id, ref_a, ref_b FROM compare_history
           WHERE user_id = ? AND kind = ?
             AND ((ref_a = ? AND ref_b = ?) OR (ref_a = ? AND ref_b = ?)
               OR (ref_a LIKE ? AND ref_b LIKE ?) OR (ref_a LIKE ? AND ref_b LIKE ?))`
        : `SELECT id, ref_a, ref_b FROM compare_history
           WHERE user_id = ? AND kind = ? AND ref_a = ? AND ref_b = ?`,
      kind === "custom"
        ? [userId, kind, nA, nB, nB, nA, `${nA}|%`, `${nB}|%`, `${nB}|%`, `${nA}|%`]
        : [userId, kind, nA, nB],
    );
    if (seen) {
      if (seen.ref_a !== nA || seen.ref_b !== nB) {
        await pool.query(
          `UPDATE compare_history SET ref_a = ?, ref_b = ? WHERE id = ? AND user_id = ?`,
          [nA, nB, seen.id, userId],
        );
      }
      // Buka ulang selalu gratis (sudah dibayar dulu), tanpa cek masa berlaku.
      return { ok: true, freshCharge: false, balance: await readBalance(userId) };
    }

    const wallet = await readWallet(userId);
    const balance = wallet.balance;
    // Token kedaluwarsa (atau belum pernah topup): tidak bisa buka yang baru.
    if (expired(wallet.expiresAt)) {
      return { ok: false, freshCharge: false, balance, reason: "expired", expiresAt: wallet.expiresAt };
    }
    if (balance < COMPARE_COST) {
      return { ok: false, freshCharge: false, balance, reason: "empty", expiresAt: wallet.expiresAt };
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [upd] = await conn.query(
        `UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND balance >= ?`,
        [COMPARE_COST, userId, COMPARE_COST],
      );
      const affected = (upd as { affectedRows?: number }).affectedRows ?? 0;
      if (affected === 0) {
        await conn.rollback();
        return { ok: false, freshCharge: false, balance: await readBalance(userId), reason: "empty" };
      }
      await conn.query(
        `INSERT INTO compare_history (user_id, kind, ref_a, ref_b, summary, cost)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, kind, nA, nB, summary.slice(0, 255), COMPARE_COST],
      );
      await conn.commit();
      // Baca ulang dari DB supaya saldo yang ditampilkan selalu akurat,
      // bukan hasil hitungan dari angka yang dibaca sebelum transaksi.
      const fresh = await readWallet(userId);
      return { ok: true, freshCharge: true, balance: fresh.balance, expiresAt: fresh.expiresAt };
    } catch (err) {
      await conn.rollback();
      // Balapan request: riwayat sudah ada → kembalikan potongan (refund)
      // supaya pengguna tidak ter-charge untuk buka ulang, lalu anggap gratis.
      if ((err as { errno?: number }).errno === 1062) {
        await conn.query(`UPDATE wallets SET balance = balance + ? WHERE user_id = ?`, [
          COMPARE_COST,
          userId,
        ]);
        const afterRefund = await readWallet(userId);
        return { ok: true, freshCharge: false, balance: afterRefund.balance, expiresAt: afterRefund.expiresAt };
      }
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    if (isDbConnectionError(err)) {
      console.error("[ensureCompareAccess] database unavailable:", err);
      return { ok: false, freshCharge: false, balance: 0, reason: "db" };
    }
    throw err;
  }
}
