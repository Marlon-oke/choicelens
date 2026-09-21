"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { topupCreate, topupConfirm, type ActionState } from "@/lib/actions";
import { formatRp, TOKEN_PRICE_RP } from "@/lib/tokens";

const PRESETS = [2, 4, 10, 20];

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

function snapScriptSrc(): string {
  return process.env.NEXT_PUBLIC_MIDTRANS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

export default function TopupClient() {
  const [qty, setQty] = useState(4);
  const [snapMsg, setSnapMsg] = useState<string | null>(null);
  const confirmFormRef = useRef<HTMLFormElement>(null);
  const [createState, createAction, creating] = useActionState<ActionState, FormData>(topupCreate, {});
  const [confirmState, confirmAction, confirming] = useActionState<ActionState, FormData>(topupConfirm, {});

  const snapToken = createState.snapToken ?? null;

  // Muat snap.js hanya saat dibutuhkan (ada snapToken dari Midtrans).
  useEffect(() => {
    if (!snapToken || window.snap) return;
    const key = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
    const s = document.createElement("script");
    s.src = snapScriptSrc();
    s.setAttribute("data-client-key", key);
    s.async = true;
    document.body.appendChild(s);
  }, [snapToken]);

  const payWithMidtrans = () => {
    setSnapMsg(null);
    if (!snapToken) return;
    if (!window.snap) {
      setSnapMsg("Popup Midtrans belum termuat, coba lagi sebentar.");
      return;
    }
    // Overlay Midtrans menempel di body (di luar .app-zoom) sehingga
    // tidak terpengaruh skala tampilan.
    window.snap.pay(snapToken, {
      onSuccess: () => confirmFormRef.current?.requestSubmit(),
      onPending: () => confirmFormRef.current?.requestSubmit(),
      onError: () => setSnapMsg("Pembayaran gagal/dibatalkan di Midtrans."),
      onClose: () => setSnapMsg("Popup ditutup sebelum bayar. Klik Bayar untuk lanjut."),
    });
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 18,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          1. Pilih jumlah token (@{formatRp(TOKEN_PRICE_RP)})
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setQty(p)}
              style={{
                border: "1px solid #dbeafe",
                background: qty === p ? "#2563eb" : "#eff6ff",
                color: qty === p ? "#fff" : "#2563eb",
                borderRadius: 10,
                padding: "10px 16px",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {p} token
            </button>
          ))}
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 800, color: "#334155" }}>
            Custom:
            <input
              type="number"
              min={1}
              max={1000}
              value={Number.isFinite(qty) ? qty : ""}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isInteger(n) && n >= 0 && n <= 1000) setQty(n);
              }}
              placeholder="1–1000"
              style={{
                width: 90,
                border: `1px solid ${!PRESETS.includes(qty) && qty >= 1 ? "#2563eb" : "#cbd5e1"}`,
                background: !PRESETS.includes(qty) && qty >= 1 ? "#eff6ff" : "#fff",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12,
                fontWeight: 800,
                color: "#0f172a",
                outline: "none",
              }}
            />
          </label>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginTop: 12 }}>
          Total: {formatRp(qty * TOKEN_PRICE_RP)}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 16 }}>
          Metode pembayaran (QRIS, VA bank, e-wallet, gerai) dipilih di popup Midtrans.
        </div>
        <form action={createAction} style={{ marginTop: 14 }}>
          <input type="hidden" name="qty" value={qty} />
          <button
            type="submit"
            disabled={creating}
            style={{
              background: "#0f172a",
              color: "#fff",
              border: 0,
              borderRadius: 10,
              padding: "12px 18px",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {creating ? "Membuat pesanan…" : "Buat Pesanan →"}
          </button>
        </form>
        {createState.message && (
          <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>{createState.message}</p>
        )}
      </div>

      {createState.orderId && !confirmState.paidQty && (
        snapToken ? (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
              Pesanan {createState.nota ?? `#${createState.orderId}`} · {formatRp(createState.amountRp ?? 0)}
            </div>
            <p style={{ fontSize: 12, color: "#475569", margin: "8px 0 0" }}>
              Rincian lengkap & pilihan metode (QRIS, VA, e-wallet, gerai) ada di popup Midtrans.
            </p>
            {snapMsg && (
              <p style={{ fontSize: 12, color: "#d97706", fontWeight: 700 }}>{snapMsg}</p>
            )}
            <button
              type="button"
              onClick={payWithMidtrans}
              style={{
                background: "#16a34a",
                color: "#fff",
                border: 0,
                borderRadius: 10,
                padding: "12px 18px",
                fontSize: 12,
                fontWeight: 800,
                marginTop: 10,
              }}
            >
              Bayar {formatRp(createState.amountRp ?? 0)} via Midtrans →
            </button>
            <form ref={confirmFormRef} action={confirmAction} style={{ display: "none" }}>
              <input type="hidden" name="orderId" value={createState.orderId} />
            </form>
          </div>
        ) : (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 12,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
            3. Bayar pesanan {createState.nota ?? `#${createState.orderId}`} · {formatRp(createState.amountRp ?? 0)}
          </div>
          <p style={{ fontSize: 11, color: "#92400e", margin: "10px 0 0" }}>
            Mode simulasi — tidak ada uang sungguhan yang bergerak.
          </p>
          <form action={confirmAction} style={{ marginTop: 10 }}>
            <input type="hidden" name="orderId" value={createState.orderId} />
            <button
              type="submit"
              disabled={confirming}
              style={{
                background: "#16a34a",
                color: "#fff",
                border: 0,
                borderRadius: 10,
                padding: "12px 18px",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {confirming ? "Memproses pembayaran…" : `Bayar ${formatRp(createState.amountRp ?? 0)} →`}
            </button>
          </form>
        </div>
        )
      )}

      {confirmState.paidQty ? (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 12,
            padding: 18,
            textAlign: "center",
          }}
        >
                    <div style={{ fontSize: 32 }}>
                <p style={{ color: "#166534", fontWeight: 700 }}>Pembayaran Berhasil</p>
              </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", marginTop: 6 }}>
            Pembayaran Berhasil
          </div>
          <div style={{ fontSize: 12, color: "#334155", marginTop: 6 }}>
            {confirmState.paidQty} token masuk ke dompetmu
            {createState.nota ? ` · Nota ${createState.nota}` : createState.orderId ? ` · Order #${createState.orderId}` : ""}
          </div>
          {!snapToken && (
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              Catatan: simulasi — tidak ada uang sungguhan yang bergerak.
            </div>
          )}
        </div>
      ) : (
        confirmState.message && (
          <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>{confirmState.message}</p>
        )
      )}
    </div>
  );
}
