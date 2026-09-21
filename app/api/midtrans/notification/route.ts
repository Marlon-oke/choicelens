import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/midtrans";
import { findOrderByNota, fulfillPaidOrder } from "@/lib/orders";

// Webhook notifikasi Midtrans. Daftarkan URL ini di dashboard Midtrans:
// https://domain-kamu/api/midtrans/notification
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  const orderId = String(body.order_id ?? "");
  const statusCode = String(body.status_code ?? "");
  const grossAmount = String(body.gross_amount ?? "");
  const signatureKey = String(body.signature_key ?? "");
  const trxStatus = String(body.transaction_status ?? "");
  const fraudStatus = String(body.fraud_status ?? "");

  if (
    !orderId ||
    !verifySignature({ orderId, statusCode, grossAmount, signatureKey })
  ) {
    return NextResponse.json({ error: "bad-signature" }, { status: 401 });
  }

  const order = await findOrderByNota(orderId);
  if (!order) return NextResponse.json({ error: "unknown-order" }, { status: 404 });

  const paid =
    trxStatus === "settlement" || (trxStatus === "capture" && fraudStatus === "accept");
  if (paid) {
    await fulfillPaidOrder(order.id, order.userId);
  } else if (trxStatus === "expire" || trxStatus === "cancel" || trxStatus === "deny") {
    const { pool } = await import("@/lib/db");
    await pool.query(`UPDATE token_orders SET status = 'cancelled' WHERE id = ?`, [order.id]);
  }
  return NextResponse.json({ ok: true });
}
