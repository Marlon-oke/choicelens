"use client";

import { useState } from "react";
import type { AdminUserRow } from "@/lib/admin";
import AdminGrantForm from "./AdminGrantForm";

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 10,
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  padding: "8px 10px",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  fontSize: 12,
  color: "#0f172a",
  padding: "8px 10px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top",
};

export default function AdminUserTable({ users }: { users: AdminUserRow[] }) {
  const [q, setQ] = useState("");
  const keyword = q.trim().toLowerCase();
  const visible = keyword
    ? users.filter(
        (u) => u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword),
      )
    : users;

  return (
    <div>
      <form
        className="search-box"
        style={{ marginBottom: 12 }}
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <span className="search-icon">⌕</span>
        <input
          type="search"
          autoComplete="off"
          placeholder="Cari nama / email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Cari pengguna"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Hapus pencarian">
            ×
          </button>
        )}
      </form>
      <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 10px" }}>
        Menampilkan {visible.length} dari {users.length} pengguna.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr>
              <th style={th}>User</th>
              <th style={th}>Role</th>
              <th style={th}>Saldo</th>
              <th style={th}>Compare</th>
              <th style={th}>Daftar</th>
              <th style={th}>Token</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...td, textAlign: "center", color: "#64748b" }}>
                  Tidak ada pengguna yang cocok dengan “{q.trim()}”.
                </td>
              </tr>
            ) : (
              visible.map((u) => (
                <tr key={u.id}>
                  <td style={td}>
                    <b>{u.name}</b>
                    <br />
                    <small style={{ color: "#64748b" }}>{u.email}</small>
                  </td>
                   <td style={td}>{u.role === "admin" ? "admin" : "user"}</td>
                  <td style={td}>🎟 {u.balance}</td>
                  <td style={td}>{u.compares}×</td>
                  <td style={td}>
                    <small style={{ color: "#64748b" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : "-"}
                    </small>
                  </td>
                  <td style={td}>
                    <AdminGrantForm userId={u.id} email={u.email} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
