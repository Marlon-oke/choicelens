import {
  products as staticProducts,
  setCatalogMirror,
  type CategoryId,
  type Product,
} from "./data";
import { query, type Row } from "./db";

// Lapisan katalog: database adalah sumber utama, lib/data.ts hanya fallback
// (DB kosong / tidak terjangkau). Satu proses = satu cache; admin memanggil
// invalidateCatalog() setiap simpan/hapus supaya langsung terlihat.
let cache: Product[] | null = null;

function rowToProduct(r: Row): Product {
  const pick = (v: unknown, fb: Record<string, never>): Record<string, string> => {
    if (typeof v === "string") {
      try {
        return JSON.parse(v) as Record<string, string>;
      } catch {
        return fb;
      }
    }
    return (v as Record<string, string>) ?? fb;
  };
  const numPick = (v: unknown): Record<string, number> => {
    if (typeof v === "string") {
      try {
        return JSON.parse(v) as Record<string, number>;
      } catch {
        return {};
      }
    }
    return (v as Record<string, number>) ?? {};
  };
  const strArr = (v: unknown): string[] => {
    if (typeof v === "string") {
      try {
        const a = JSON.parse(v) as unknown;
        return Array.isArray(a) ? (a as string[]) : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(v) ? (v as string[]) : [];
  };
  let variants = undefined;
  const rawVar = r.variants_json as unknown;
  if (rawVar) {
    try {
      const parsed = typeof rawVar === "string" ? JSON.parse(rawVar) : rawVar;
      if (Array.isArray(parsed)) variants = parsed;
    } catch {
      variants = undefined;
    }
  }
  let affiliate = undefined;
  const rawAff = r.affiliate_json as unknown;
  if (rawAff) {
    try {
      const parsed = typeof rawAff === "string" ? JSON.parse(rawAff) : rawAff;
      if (Array.isArray(parsed)) {
        const clean = (parsed as Array<Record<string, unknown>>)
          .filter((a) => typeof a?.label === "string" && typeof a?.url === "string")
          .map((a) => ({ label: (a.label as string).slice(0, 40), url: a.url as string }))
          .filter((a) => /^https?:\/\//i.test(a.url));
        if (clean.length > 0) affiliate = clean;
      }
    } catch {
      affiliate = undefined;
    }
  }
  return {
    id: String(r.id ?? ""),
    category: r.category as CategoryId,
    name: String(r.name ?? ""),
    brand: String(r.brand ?? ""),
    img: String(r.img ?? ""),
    score: Number(r.score ?? 0),
    keywords: String(r.keywords ?? ""),
    strengths: strArr(r.strengths_json),
    specs: pick(r.specs_json, {}),
    ratings: numPick(r.ratings_json),
    ...(variants ? { variants } : {}),
    ...(affiliate ? { affiliate } : {}),
  };
}

async function loadCatalog(): Promise<Product[]> {
  try {
    const rows = await query<Row>(
      `SELECT id, category, name, brand, img, score, keywords,
              strengths_json, specs_json, ratings_json, variants_json, affiliate_json
       FROM products ORDER BY id`,
    );
    if (rows.length === 0) return staticProducts;
    return rows.map(rowToProduct);
  } catch {
    return staticProducts;
  }
}

export async function ensureCatalog(): Promise<Product[]> {
  if (!cache) {
    cache = await loadCatalog();
    setCatalogMirror(cache);
  }
  return cache;
}

export function getCatalogSync(): Product[] {
  return cache ?? staticProducts;
}

export function invalidateCatalog(): void {
  cache = null;
  setCatalogMirror(undefined);
}
