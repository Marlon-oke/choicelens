import type { Metadata } from "next";
import { requireAdmin, getAdminStats, listUsers, listRecentCompares, listRecentOrders } from "@/lib/admin";
import { formatRp } from "@/lib/tokens";
import PageHeader from "@/components/PageHeader";
import AdminUserTable from "@/components/AdminUserTable";

export const metadata: Metadata = {
  title: "Admin Dashboard — ChoiceLens",
  description: "Kelola pengguna, token, dan riwayat compare.",
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 18,
};

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

export default async function AdminPage() {
  const me = await requireAdmin();
  const [stats, users, compares, orders] = await Promise.all([
    getAdminStats(),
    listUsers(200),
    listRecentCompares(20),
    listRecentOrders(20),
  ]);

  const statItems: Array<[string, string]> = [
    ["Pengguna", String(stats.users)],
    ["Token beredar", `🎟 ${stats.tokensInCirculation}`],
    ["Total compare", String(stats.comparesTotal)],
    ["Compare hari ini", String(stats.comparesToday)],
    ["Order pending", String(stats.ordersPending)],
    ["Pendapatan (paid)", formatRp(stats.revenuePaidRp)],
  ];

  return (
    <main className="section">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Admin" }]}
        title={`🛡 Admin — Halo, ${me.name}`}
        desc={me.email}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {statItems.map(([label, value]) => (
          <div key={label} style={card}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b" }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      <section style={{ ...card, marginBottom: 16, overflowX: "auto" }}>
        <h2 style={{ fontSize: 14, margin: "0 0 10px" }}>Pengguna ({users.length})</h2>
        <AdminUserTable users={users} />
      </section>

      <section style={{ ...card, marginBottom: 16, overflowX: "auto" }}>
        <h2 style={{ fontSize: 14, margin: "0 0 10px" }}>Compare terbaru ({compares.length})</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr>
              <th style={th}>User</th>
              <th style={th}>Jenis</th>
              <th style={th}>Pasangan</th>
              <th style={th}>Biaya</th>
              <th style={th}>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {compares.map((c) => (
              <tr key={c.id}>
                <td style={td}>
                  <small>{c.email}</small>
                </td>
                <td style={td}>{c.kind}</td>
                <td style={td}>
                  <small>
                    {c.ref_a} vs {c.ref_b}
                  </small>
                </td>
                <td style={td}>−{c.cost}</td>
                <td style={td}>
                  <small style={{ color: "#64748b" }}>
                    {c.created_at ? new Date(c.created_at).toLocaleString("id-ID") : "-"}
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ ...card, overflowX: "auto" }}>
        <h2 style={{ fontSize: 14, margin: "0 0 10px" }}>Order token terbaru ({orders.length})</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr>
              <th style={th}>Nota</th>
              <th style={th}>User</th>
              <th style={th}>Qty</th>
              <th style={th}>Nominal</th>
              <th style={th}>Status</th>
              <th style={th}>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={td}>
                  <b>{o.nota}</b>
                </td>
                <td style={td}>
                  <small>{o.email}</small>
                </td>
                <td style={td}>{o.qty} token</td>
                <td style={td}>{formatRp(o.amount_rp)}</td>
                <td style={td}>{o.status}</td>
                <td style={td}>
                  <small style={{ color: "#64748b" }}>
                    {o.created_at ? new Date(o.created_at).toLocaleString("id-ID") : "-"}
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
