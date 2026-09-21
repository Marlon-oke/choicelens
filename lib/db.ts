import mysql from "mysql2/promise";

declare global {
  var __choicelensPool: mysql.Pool | undefined;
}

function getPool(): mysql.Pool {
  if (!globalThis.__choicelensPool) {
    globalThis.__choicelensPool = mysql.createPool({
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "choicelens",
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  }
  return globalThis.__choicelensPool;
}

export const pool = getPool();

export type Row = Record<string, unknown>;

export async function query<T extends Row = Row>(sql: string, params?: unknown[]): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export async function queryOne<T extends Row = Row>(
  sql: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
