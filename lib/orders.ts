import { pool, type Row } from "./db";

// Tandai order lunas + masukkan token (reset masa berlaku 1 bulan).
// Idempotent: order yang sudah paid tidak diproses ulang.
// Dipakai topupConfirm (manual) dan webhook Midtrans.
export async function fulfillPaidOrder(
  orderId: number,
  userId: number,
): Promise<{ ok: boolean; paidQty: number; alreadyPaid: boolean }> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT id, qty, status FROM token_orders WHERE id = ? AND user_id = ?`,
      [orderId, userId],
    );
    const order = (rows as Row[])[0];
    if (!order) {
      await conn.rollback();
      return { ok: false, paidQty: 0, alreadyPaid: false };
    }
    if (order.status === "paid") {
      await conn.rollback();
      return { ok: true, paidQty: Number(order.qty), alreadyPaid: true };
    }
    await conn.query(
      `UPDATE token_orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [orderId],
    );
    await conn.query(
      `INSERT INTO wallets (user_id, balance, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 MONTH))
       ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance),
         expires_at = DATE_ADD(NOW(), INTERVAL 1 MONTH)`,
      [userId, Number(order.qty)],
    );
    await conn.commit();
    return { ok: true, paidQty: Number(order.qty), alreadyPaid: false };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function findOrderByNota(
  nota: string,
): Promise<{ id: number; userId: number; qty: number; amountRp: number; status: string } | null> {
  const [rows] = await pool.query(
    `SELECT id, user_id AS userId, qty, amount_rp AS amountRp, status FROM token_orders WHERE nota = ?`,
    [nota],
  );
  const o = (rows as Row[])[0];
  if (!o) return null;
  return {
    id: o.id as number,
    userId: o.userId as number,
    qty: Number(o.qty),
    amountRp: Number(o.amountRp),
    status: String(o.status),
  };
}
