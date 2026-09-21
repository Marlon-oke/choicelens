import midtransClient from "midtrans-client";
import { createHash } from "node:crypto";

export function isMidtransConfigured(): boolean {
  return Boolean(process.env.MIDTRANS_SERVER_KEY);
}

export function midtransClientKey(): string {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
}

function snap(): InstanceType<typeof midtransClient.Snap> {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY as string,
  });
}

export async function createSnapTransaction(params: {
  nota: string;
  amountRp: number;
  qty: number;
  email: string;
  name: string;
}): Promise<{ token: string; redirectUrl: string }> {
  const trx = await snap().createTransaction({
    transaction_details: {
      order_id: params.nota,
      gross_amount: params.amountRp,
    },
    item_details: [
      {
        id: "token",
        price: Math.round(params.amountRp / params.qty),
        quantity: params.qty,
        name: `${params.qty} Token ChoiceLens`,
      },
    ],
    customer_details: {
      first_name: params.name,
      email: params.email,
    },
  });
  return { token: trx.token as string, redirectUrl: trx.redirect_url as string };
}

export function verifySignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
  const expected = createHash("sha512")
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${serverKey}`)
    .digest("hex");
  return expected === input.signatureKey;
}
