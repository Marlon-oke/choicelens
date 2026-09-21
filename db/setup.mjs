// Membuat database + tabel ChoiceLens di MySQL/MariaDB XAMPP.
// Cara pakai: node db/setup.mjs
// Kredensial dibaca dari environment (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME).
// Admin awal: ADMIN_EMAIL / ADMIN_PASSWORD (default admin@choicelens.local / admin123).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import mysql from "mysql2/promise";

const scrypt = promisify(scryptCb);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

const root = dirname(fileURLToPath(import.meta.url));
const rawSchema = readFileSync(join(root, "schema.sql"), "utf8");
// Hormati DB_NAME dari environment: buang CREATE/USE bawaan schema,
// database dipilih lewat kode di bawah.
const schema = rawSchema
  .replace(/CREATE DATABASE IF NOT EXISTS[\s\S]*?;/, "")
  .replace(/USE\s+\w+;/, "");

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  multipleStatements: true,
});

try {
  const dbName = process.env.DB_NAME ?? "choicelens";
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci`,
  );
  await conn.changeUser({ database: dbName });
  await conn.query(schema);
  const [[db]] = await conn.query("SELECT DATABASE() AS db");
  const [tables] = await conn.query(
    "SELECT TABLE_NAME AS t FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
    [dbName],
  );
  console.log("database:", db.db);
  console.log(
    "tables:",
    tables.map((r) => r.t).join(", "),
  );

  // Migrasi idempotent: tambah kolom role kalau DB lama belum punya.
  const [[col]] = await conn.query(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
    [dbName],
  );
  if (Number(col.n) === 0) {
    await conn.query(
      `ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user'`,
    );
    console.log("migrasi: kolom users.role ditambahkan");
  }

  // Migrasi idempotent: masa berlaku token (1 bulan per topup).
  const [[ecol]] = await conn.query(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'wallets' AND COLUMN_NAME = 'expires_at'`,
    [dbName],
  );
  if (Number(ecol.n) === 0) {
    await conn.query(`ALTER TABLE wallets ADD COLUMN expires_at TIMESTAMP NULL DEFAULT NULL`);
    console.log("migrasi: kolom wallets.expires_at ditambahkan");
  }

  // Migrasi idempotent: link affiliate per produk.
  const [[acol]] = await conn.query(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'affiliate_json'`,
    [dbName],
  );
  if (Number(acol.n) === 0) {
    await conn.query(`ALTER TABLE products ADD COLUMN affiliate_json TEXT NULL`);
    console.log("migrasi: kolom products.affiliate_json ditambahkan");
  }

  // Migrasi idempotent: kode nota unik per order.
  const [[ncol]] = await conn.query(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'token_orders' AND COLUMN_NAME = 'nota'`,
    [dbName],
  );
  if (Number(ncol.n) === 0) {
    await conn.query(`ALTER TABLE token_orders ADD COLUMN nota VARCHAR(32) NULL DEFAULT NULL`);
    const [old] = await conn.query(`SELECT id, created_at FROM token_orders WHERE nota IS NULL`);
    const rand = () => Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
    const stamp = (d) => {
      const t = new Date(d);
      const p = (x) => String(x).padStart(2, "0");
      return `${t.getFullYear()}${p(t.getMonth() + 1)}${p(t.getDate())}`;
    };
    for (const r of old) {
      for (let i = 0; i < 5; i++) {
        const nota = `CL-${stamp(r.created_at)}-${rand()}`;
        try {
          await conn.query(`UPDATE token_orders SET nota = ? WHERE id = ? AND nota IS NULL`, [nota, r.id]);
          break;
        } catch (e) {
          if (e?.errno !== 1062 || i === 4) throw e;
        }
      }
    }
    await conn.query(`ALTER TABLE token_orders MODIFY nota VARCHAR(32) NOT NULL`);
    try {
      await conn.query(`ALTER TABLE token_orders ADD UNIQUE KEY uq_orders_nota (nota)`);
    } catch (e) {
      if (e?.errno !== 1061) throw e;
    }
    console.log("migrasi: kolom token_orders.nota ditambahkan + backfill");
  }

  // Seed akun admin (hanya kalau email belum terdaftar).
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@choicelens.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const [[exists]] = await conn.query(`SELECT id FROM users WHERE email = ?`, [adminEmail]);
  if (!exists) {
    const [res] = await conn.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`,
      ["Admin", adminEmail, await hashPassword(adminPassword)],
    );
    await conn.query(`INSERT INTO wallets (user_id, balance) VALUES (?, 0)`, [res.insertId]);
    console.log(`admin dibuat: ${adminEmail} (password default: ${adminPassword}) — segera ganti!`);
  } else {
    await conn.query(`UPDATE users SET role = 'admin' WHERE email = ?`, [adminEmail]);
    console.log(`admin siap: ${adminEmail}`);
  }
} finally {
  await conn.end();
}
