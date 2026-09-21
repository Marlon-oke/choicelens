// Seed katalog produk dari lib/data.ts (hasil kompilasi) ke tabel products.
// Cara pakai:
//   npx tsc lib/data.ts --outDir /tmp/cl-data --module nodenext --moduleResolution nodenext --target es2022 --skipLibCheck
//   node db/seed-products.mjs /tmp/cl-data/data.js
// DB dibaca dari .env.local + environment (DB_*), bisa di-override.
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import mysql from "mysql2/promise";

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  }
}

loadDotEnv(new URL("../.env.local", import.meta.url).pathname);

const compiledPath = process.argv[2];
if (!compiledPath) {
  console.error("Pakai: node db/seed-products.mjs /path/ke/data.js");
  process.exit(1);
}

const { products } = await import(compiledPath);
if (!Array.isArray(products) || products.length === 0) {
  console.error("Tidak ada produk di file kompilasi.");
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "choicelens",
  multipleStatements: true,
});

const req = createRequire(import.meta.url);
void req;

try {
  let upserted = 0;
  for (const p of products) {
    await conn.query(
      `INSERT INTO products
         (id, category, name, brand, img, score, keywords,
          strengths_json, specs_json, ratings_json, variants_json, affiliate_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
       ON DUPLICATE KEY UPDATE
         category = VALUES(category), name = VALUES(name), brand = VALUES(brand),
         img = VALUES(img), score = VALUES(score), keywords = VALUES(keywords),
         strengths_json = VALUES(strengths_json), specs_json = VALUES(specs_json),
         ratings_json = VALUES(ratings_json), variants_json = VALUES(variants_json)`,
      [
        p.id,
        p.category,
        p.name,
        p.brand,
        p.img ?? "",
        p.score ?? 0,
        p.keywords ?? "",
        JSON.stringify(p.strengths ?? []),
        JSON.stringify(p.specs ?? {}),
        JSON.stringify(p.ratings ?? {}),
        p.variants ? JSON.stringify(p.variants) : null,
      ],
    );
    upserted++;
  }
  const [[row]] = await conn.query(`SELECT COUNT(*) AS n FROM products`);
  console.log(`seed: ${upserted} produk diproses, total di DB: ${row.n}`);
} finally {
  await conn.end();
}
