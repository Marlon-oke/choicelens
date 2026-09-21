"use client";

import { useActionState } from "react";
import { signup, type ActionState } from "@/lib/actions";

export default function RegisterForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(signup, {});

  return (
    <form action={action} style={{ display: "grid", gap: 12, marginTop: 16 }}>
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: "#334155" }}>
        Nama
        <input
          name="name"
          required
          minLength={2}
          placeholder="Nama kamu"
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            outline: "none",
          }}
        />
      </label>
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: "#334155" }}>
        Email
        <input
          name="email"
          type="email"
          required
          placeholder="nama@email.com"
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            outline: "none",
          }}
        />
      </label>
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: "#334155" }}>
        Password (min. 6 karakter)
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••"
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            outline: "none",
          }}
        />
      </label>
      {state.message && (
        <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, margin: 0 }}>{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        style={{
          background: "#2563eb",
          color: "#fff",
          border: 0,
          borderRadius: 10,
          padding: "12px",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {pending ? "Mendaftar…" : "Daftar"}
      </button>
    </form>
  );
}
