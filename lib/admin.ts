import { redirect } from "next/navigation";
import { verifySession } from "./session";
import { getAccount, type Account } from "./account";
import { query, queryOne, type Row } from "./db";

export async function requireAdmin(): Promise<Account> {
  const session = await verifySession();
  if (!session) redirect("/admin/login");
  const account = await getAccount(session.userId);
  if (!account || account.role !== "admin") redirect("/admin/login");
  return account;
}

export interface AdminStats {
  users: number;
  tokensInCirculation: number;
  comparesTotal: number;
  comparesToday: number;
  ordersPending: number;
  revenuePaidRp: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const users = await queryOne<Row>(`SELECT COUNT(*) AS n FROM users`);
  const tokens = await queryOne<Row>(`SELECT COALESCE(SUM(balance), 0) AS n FROM wallets`);
  const total = await queryOne<Row>(`SELECT COUNT(*) AS n FROM compare_history`);
  const today = await queryOne<Row>(
    `SELECT COUNT(*) AS n FROM compare_history WHERE created_at >= CURDATE()`,
  );
  const pending = await queryOne<Row>(
    `SELECT COUNT(*) AS n FROM token_orders WHERE status = 'pending'`,
  );
  const revenue = await queryOne<Row>(
    `SELECT COALESCE(SUM(amount_rp), 0) AS n FROM token_orders WHERE status = 'paid'`,
  );
  return {
    users: Number(users?.n ?? 0),
    tokensInCirculation: Number(tokens?.n ?? 0),
    comparesTotal: Number(total?.n ?? 0),
    comparesToday: Number(today?.n ?? 0),
    ordersPending: Number(pending?.n ?? 0),
    revenuePaidRp: Number(revenue?.n ?? 0),
  };
}

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  balance: number;
  compares: number;
  created_at: string;
}

export async function listUsers(limit = 50): Promise<AdminUserRow[]> {
  const rows = await query<Row>(
    `SELECT u.id, u.name, u.email, u.role, COALESCE(w.balance, 0) AS balance,
            (SELECT COUNT(*) FROM compare_history h WHERE h.user_id = u.id) AS compares,
            u.created_at
     FROM users u LEFT JOIN wallets w ON w.user_id = u.id
     ORDER BY u.id DESC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    email: r.email as string,
    role: String(r.role ?? "user"),
    balance: Number(r.balance ?? 0),
    compares: Number(r.compares ?? 0),
    created_at: String(r.created_at ?? ""),
  }));
}

export interface AdminCompareRow {
  id: number;
  email: string;
  kind: string;
  ref_a: string;
  ref_b: string;
  cost: number;
  created_at: string;
}

export async function listRecentCompares(limit = 20): Promise<AdminCompareRow[]> {
  const rows = await query<Row>(
    `SELECT h.id, u.email, h.kind, h.ref_a, h.ref_b, h.cost, h.created_at
     FROM compare_history h JOIN users u ON u.id = h.user_id
     ORDER BY h.id DESC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({
    id: r.id as number,
    email: r.email as string,
    kind: String(r.kind ?? ""),
    ref_a: String(r.ref_a ?? ""),
    ref_b: String(r.ref_b ?? ""),
    cost: Number(r.cost ?? 0),
    created_at: String(r.created_at ?? ""),
  }));
}

export interface AdminOrderRow {
  id: number;
  nota: string;
  email: string;
  qty: number;
  amount_rp: number;
  status: string;
  created_at: string;
}

export async function listRecentOrders(limit = 20): Promise<AdminOrderRow[]> {
  const rows = await query<Row>(
    `SELECT o.id, o.nota, u.email, o.qty, o.amount_rp, o.status, o.created_at
     FROM token_orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.id DESC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({
    id: r.id as number,
    nota: String(r.nota ?? `#${r.id as number}`),
    email: r.email as string,
    qty: Number(r.qty ?? 0),
    amount_rp: Number(r.amount_rp ?? 0),
    status: String(r.status ?? ""),
    created_at: String(r.created_at ?? ""),
  }));
}
