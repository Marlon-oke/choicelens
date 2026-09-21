"use client";

import { useActionState } from "react";
import { adminGrantTokens, type ActionState } from "@/lib/actions";

export default function AdminGrantForm({ userId, email }: { userId: number; email: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(adminGrantTokens, {});

  return (
    <form action={action} style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input type="hidden" name="userId" value={userId} />
      <input
        name="qty"
        type="number"
        min={-1000}
        max={1000}
        defaultValue={0}
        title={`Ubah token untuk ${email} (negatif = kurangi)`}
        style={{
          width: 64,
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "6px 8px",
          fontSize: 11,
        }}
      />
      <button
        type="submit"
        disabled={pending}
        title={`Ubah token untuk ${email}`}
        style={{
          background: "#f0fdf4",
          color: "#166534",
          border: "1px solid #bbf7d0",
          borderRadius: 8,
          padding: "6px 10px",
          fontSize: 11,
          fontWeight: 800,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {state.paidQty ? `${state.paidQty > 0 ? "+" : ""}${state.paidQty} ✓` : pending ? "…" : "Terapkan"}
      </button>
    </form>
  );
}
