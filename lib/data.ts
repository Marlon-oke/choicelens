export type CategoryId = "smartphones" | "laptops" | "shoes";

export type Product = {
  id: string;
  category: CategoryId;
  name: string;
  brand: string;
  img: string;
  score: number;
  keywords: string;
  strengths: string[];
  specs: Record<string, string>;
  ratings: Record<string, number>;
  variants?: VariantGroup[];
  affiliate?: AffiliateLink[];
  variantDesc?: string;
  variantSig?: string;
};

export type CompareProduct = {
  name: string;
  brand: string;
  img: string;
  score: number;
};

export type Comparison = {
  slug: string;
  category: CategoryId;
  searchKeywords: string;
  products: [CompareProduct, CompareProduct];
  tagline?: string;
  specs?: SpecRow[];
};

export type LearnChapter = {
  heading: string;
  body: string;
};

export type LearnItem = {
  title: string;
  desc: string;
  icon: string;
  artClass: string;
  img?: string;
  slug: string;
  kind: string;
  audience: CategoryId[];
  example: string;
  chapters?: LearnChapter[];
};

export type FeaturedMetric = {
  label: string;
  icon: string;
  a: number;
  b: number;
};

export type VariantGroup = {
  key: string;
  label: string;
  options: Array<{ value: string; price?: number }>;
};

export type VariantPicks = Record<string, number>;

export type AffiliateLink = {
  label: string;
  url: string;
};

export type SpecRow = {
  label: string;
  a?: string;
  b?: string;
  scoreA?: number;
  scoreB?: number;
  learnSlugs?: string[];
};

export type CategoryMeta = {
  id: string;
  name: string;
  desc: string;
  icon: string;
};

export const categoriesMeta: Record<string, CategoryMeta> = {
  smartphones: { id: "smartphones", name: "Smartphones", desc: "Bandingkan smartphone, fitur kamera, baterai, performa, dan harga.", icon: "▯" },
  laptops: { id: "laptops", name: "Laptops", desc: "Dari chip hingga baterai, temukan laptop terbaik untuk kamu.", icon: "▱" },
  shoes: { id: "shoes", name: "Basketball Shoes", desc: "Cari sepatu basket terbaik untuk gaya bermainmu.", icon: "⌁" },
};

export const categoryIds = Object.keys(categoriesMeta) as CategoryId[];

export const comparisons: Comparison[] = [
  {
    slug: "iphone-16-pro-vs-galaxy-s25-ultra",
    category: "smartphones",
    searchKeywords: "iphone 16 pro galaxy s25 ultra apple samsung",
    products: [
      { name: "iPhone 16 Pro", brand: "Apple", img: "/apple-iphone-16-pro-grey.jpg", score: 92 },
      { name: "Galaxy S25 Ultra", brand: "Samsung", img: "/samsung-galaxy-s25-ultra-grey.jpg", score: 89 },
    ],
  },
  {
    slug: "macbook-air-m3-vs-thinkpad-t14s",
    category: "laptops",
    searchKeywords: "macbook air m3 thinkpad t14s apple lenovo",
    products: [
      { name: "MacBook Air M3", brand: "Apple", img: "/apple-macbook-air-m3.jpeg", score: 90 },
      { name: "ThinkPad T14s", brand: "Lenovo", img: "/thinkpad-t14s.avif", score: 82 },
    ],
  },
  {
    slug: "lebron-22-vs-harden-vol-8",
    category: "shoes",
    searchKeywords: "nike lebron 22 adidas harden vol 8 basketball shoes",
    products: [
      { name: "Nike LeBron 22", brand: "Nike", img: "/lebron-22.jpg", score: 88 },
      { name: "Adidas Harden Vol. 8", brand: "Adidas", img: "/harden-vol-8.png", score: 84 },
    ],
  },
  {
    slug: "iphone-15-vs-pixel-8",
    category: "smartphones",
    searchKeywords: "iphone 15 pixel 8 apple google",
    products: [
      { name: "iPhone 15", brand: "Apple", img: "/apple-iphone-15-blue.jpeg", score: 86 },
      { name: "Pixel 8", brand: "Google", img: "/google-pixel-8.jpg", score: 80 },
    ],
  },
];

export const learnItems: LearnItem[] = [
  { title: "AMOLED", desc: "Layar lebih hidup, kontras lebih tinggi, dan lebih hemat daya.", icon: "▣", artClass: "gradient-screen", slug: "amoled", kind: "Display", audience: ["smartphones"], example: "iPhone 14 Pro, Samsung Galaxy S23" },
  { title: "LTPO", desc: "Refresh rate adaptif untuk performa dan daya tahan baterai yang lebih baik.", icon: "▤", artClass: "layers", slug: "ltpo", kind: "Battery", audience: ["smartphones"], example: "iPhone 13, Google Pixel 7" },
  { title: "PEBA", desc: "Bahan midsole premium yang lebih ringan, empuk, dan responsif.", icon: "◌", artClass: "foam", slug: "peba", kind: "Sole", audience: ["shoes"], example: "Nike Air Max 270, Adidas UltraBoost" },
  { title: "Carbon Fiber", desc: "Material kuat, ringan, dan fleksibel untuk performa maksimal.", icon: "✥", artClass: "carbon", img: "/carbon-fiber.avif", slug: "carbon-fiber", kind: "Material", audience: ["laptops"], example: "MacBook Pro, Framework Laptop" },
];

export const featuredMetrics: FeaturedMetric[] = [
  { label: "Performa", icon: "⚙", a: 94, b: 90 },
  { label: "Kamera", icon: "▣", a: 96, b: 88 },
  { label: "Baterai", icon: "◴", a: 90, b: 87 },
];

export const products: Product[] = [
  {
    id: "iphone-16-pro", category: "smartphones", name: "iPhone 16 Pro", brand: "Apple", img: "/apple-iphone-16-pro-grey.jpg", score: 92, keywords: "iphone 16 pro apple a18 pro camera",
    strengths: ["Kinerja terbaik A18 Pro", "Kamera terbaik di kelasnya", "Desain premium"],
    specs: { Chipset: "A18 Pro", Layar: "6.1 inci Super Retina XDR", Baterai: "Waktu bicara 28 jam", Kamera: "48MP utama, 12MP ultra-wide, 12MP telephoto 3x" },
    ratings: { Chipset: 100, Layar: 95, Baterai: 88, Kamera: 96 },
    variants: [],
    affiliate: [{ label: "Beli di Apple Store", url: "https://www.apple.com/shop/product/MT7A3" }],
  },
  {
    id: "galaxy-s25-ultra", category: "smartphones", name: "Galaxy S25 Ultra", brand: "Samsung", img: "/samsung-galaxy-s25-ultra-grey.jpg", score: 89, keywords: "galaxy s25 ultra samsung serpihan AI kamera zoom",
    strengths: ["Kamera periskop 10x", "AI Camera Adapt", "S Pen terintegrasi"],
    specs: { Chipset: "Snapdragon 8 Gen 3", Layar: "6.8 inci Dynamic AMOLED 2X", Baterai: "Waktu bicara 30 jam", Kamera: "200MP utama, 10MP periskop, 12MP ultra-wide" },
    ratings: { Chipset: 94, Layar: 92, Baterai: 85, Kamera: 93 },
    variants: [{ key: "storage", label: "Storage", options: [{ value: "256GB", price: 1299 }, { value: "512GB", price: 1499 }, { value: "1TB", price: 1699 }] }],
    affiliate: [{ label: "Beli di Samsung", url: "https://www.samsung.com/id/smartphones/galaxy-s25-ultra/" }],
  },
  {
    id: "macbook-air-m3", category: "laptops", name: "MacBook Air M3", brand: "Apple", img: "/apple-macbook-air-m3.jpeg", score: 90, keywords: "macbook air m3 apple chip m3",
    strengths: ["Chip M3 efisien daya", "Layar Liquid Retina 13.6 inci", "Baterai tahan lama"],
    specs: { Chipset: "Apple M3", Layar: "13.6 inci Liquid Retina", Baterai: "Hingga 18 jam", RAM: "8GB atau 18GB unified" },
    ratings: { Chipset: 96, Layar: 91, Baterai: 89, RAM: 85 },
    variants: [
      { key: "ram", label: "RAM", options: [{ value: "8GB", price: 999 }, { value: "18GB", price: 1199 }] },
      { key: "storage", label: "Storage", options: [{ value: "256GB", price: 1099 }, { value: "512GB", price: 1299 }, { value: "1TB", price: 1499 }] },
    ],
    affiliate: [{ label: "Beli di Apple Store", url: "https://www.apple.com/shop/product/MT9A3" }],
  },
  {
    id: "thinkpad-t14s", category: "laptops", name: "ThinkPad T14s", brand: "Lenovo", img: "/thinkpad-t14s.avif", score: 82, keywords: "thinkpad t14s lenovo business laptop",
    strengths: ["Layar OLED 14 inci", "Baterai tahan lama", "Security ThinkPad"],
    specs: { Chipset: "Intel Core i5-i7", Layar: "14 inci OLED 2.8K", Baterai: "Hingga 15 jam", RAM: "16GB atau 32GB" },
    ratings: { Chipset: 78, Layar: 88, Baterai: 86, RAM: 84 },
    variants: [
      { key: "chip", label: "Chip", options: [{ value: "i5", price: 899 }, { value: "i7", price: 1099 }] },
      { key: "ram", label: "RAM", options: [{ value: "16GB", price: 1099 }, { value: "32GB", price: 1299 }] },
      { key: "storage", label: "Storage", options: [{ value: "512GB", price: 999 }, { value: "1TB", price: 1199 }] },
    ],
    affiliate: [{ label: "Beli di Lenovo", url: "https://www.lenovo.com/id/en/laptops/thinkpad/thinkpad-t-series/t14s/" }],
  },
  {
    id: "lebron-22", category: "shoes", name: "Nike LeBron 22", brand: "Nike", img: "/lebron-22.jpg", score: 88, keywords: "lebron 22 nike basketball shoe performance",
    strengths: ["Teknologi ZoomX", "Desain ringan", "Kenyamanan maksimal"],
    specs: { Upper: "Knit + Flywire", Midsole: "ZoomX", Outsole: "Rubber", Berat: "290g", "Cocok untuk": "Forward court, half-court" },
    ratings: { Upper: 95, Midsole: 97, Outsole: 85, Berat: 75 },
    variants: [
      { key: "size", label: "Ukuran", options: [{ value: "US 8", price: 139 }, { value: "US 9", price: 139 }, { value: "US 10", price: 139 }, { value: "US 11", price: 139 }] },
      { key: "color", label: "Warna", options: [{ value: "Phantom", price: 139 }, { value: "Gym Red", price: 139 }, { value: "Underground", price: 139 }] },
    ],
    affiliate: [{ label: "Beli di Nike", url: "https://www.nike.com/id/t/air-jordan-1/" }],
  },
  {
    id: "harden-vol-8", category: "shoes", name: "Adidas Harden Vol. 8", brand: "Adidas", img: "/harden-vol-8.png", score: 84, keywords: "harden vol 8 adidas basketball shoe court",
    strengths: ["Desain killer pivot", "Solmid responsif", "Trap Z tanpa kait"],
    specs: { Upper: "Primeknit", Midsole: "Boost", Outsole: "Gum Rubber", Berat: "305g", "Cocok untuk": "All-court, penjaga sudut" },
    ratings: { Upper: 88, Midsole: 90, Outsole: 87, Berat: 80 },
    variants: [
      { key: "size", label: "Ukuran", options: [{ value: "US 8", price: 129 }, { value: "US 9", price: 129 }, { value: "US 10", price: 129 }, { value: "US 11", price: 129 }] },
      { key: "color", label: "Warna", options: [{ value: "Black", price: 129 }, { value: "Clay", price: 129 }, { value: "Purple", price: 129 }] },
    ],
    affiliate: [{ label: "Beli di Adidas", url: "https://www.adidas.com/en/shoes/harden-vol-8-m" }],
  },
  {
    id: "iphone-15", category: "smartphones", name: "iPhone 15", brand: "Apple", img: "/apple-iphone-15-blue.jpeg", score: 86, keywords: "iphone 15 apple usb-c dynamic island",
    strengths: ["USB-C", "Dynamic Island", "Warna pilihan"],
    specs: { Chipset: "A16 Bionic", Layar: "6.1 inci Super Retina XDR", Baterai: "Waktu bicara 20 jam", USB: "USB-C" },
    ratings: { Chipset: 90, Layar: 89, Baterai: 83, USB: 95 },
    variants: [],
    affiliate: [{ label: "Beli di Apple Store", url: "https://www.apple.com/shop/product/MT284" }],
  },
  {
    id: "pixel-8", category: "smartphones", name: "Pixel 8", brand: "Google", img: "/google-pixel-8.jpg", score: 80, keywords: "pixel 8 google tensor g3 ai kamera",
    strengths: ["Google Tensor G3", "AI Photography", "Update OS 4 tahun"],
    specs: { Chipset: "Google Tensor G3", Layar: "6.2 inci OLED", Baterai: "Waktu bicara 22 jam", Kamera: "50MP utama, 48MP telephoto" },
    ratings: { Chipset: 85, Layar: 88, Baterai: 82, Kamera: 84 },
    variants: [{ key: "storage", label: "Storage", options: [{ value: "128GB", price: 899 }, { value: "256GB", price: 999 }, { value: "512GB", price: 1199 }] }],
    affiliate: [{ label: "Beli di Google Store", url: "https://store.google.com/product/pixel_8" }],
  },
];

export const specGlossary: Record<string, { simple: string; learnSlugs: string[] }> = {
  Chipset: { simple: "Otak smartphone/laptop yang menentukan kecepatan dan efisiensi daya.", learnSlugs: ["amoled", "ltpo"] },
  Layar: { simple: "Ukuran dan teknologi layar yang memengaruhi pengalaman visual dan konsumsi daya.", learnSlugs: ["amoled"] },
  Baterai: { simple: "Kapasitas daya yang menentukan berapa lama perangkat bisa digunakan.", learnSlugs: ["ltpo"] },
  Kamera: { simple: "Sistem fotografi pada smartphone yang mencakup kualitas gambar, zoom, dan fitur.", learnSlugs: [] },
  Upper: { simple: "Bagian atas sepatu yang memberikan dukungan dan breathability.", learnSlugs: [] },
  Midsole: { simple: "Lapisan antara upper dan outsole yang memberikan bantalan dan dukungan.", learnSlugs: ["peba", "carbon-fiber"] },
  Outsole: { simple: "Bagian bawah sepatu yang menyentuh tanah dan memberikan traksi.", learnSlugs: [] },
  Berat: { simple: "Berat sepatu yang memengaruhi kecepatan dan kenyamanan.", learnSlugs: [] },
  RAM: { simple: "Memori sementara yang memungkinkan aplikasi berjalan lancar.", learnSlugs: [] },
  USB: { simple: "Port untuk pengisian daya dan transfer data.", learnSlugs: [] },
};

export const specVerdict = (scoreA: number | undefined | null, scoreB: number | undefined | null): string => {
  if ((scoreA === null || scoreA === undefined) && (scoreB === null || scoreB === undefined)) return "Seri";
  if (scoreA === null || scoreA === undefined) return "Menang: Produk B";
  if (scoreB === null || scoreB === undefined) return "Menang: Produk A";
  if (scoreA > scoreB) return "Menang: Produk A";
  if (scoreB > scoreA) return "Menang: Produk B";
  return "Seri";
};

export function getSmartphoneFilterOptions(products: Product[]) {
  return { brands: Array.from(new Set(products.map((p) => p.brand))) };
}

export const productsByCategory = (category: CategoryId): Product[] => products.filter((p) => p.category === category);

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function findProductIdByName(name: string): string | undefined {
  const p = products.find((p) => p.name === name);
  return p?.id;
}

export function productBlurb(p: Product): string {
  const s = p.specs;
  if (p.category === "shoes") {
    const parts = [`${p.name} memakai upper ${s["Upper"] ?? "andal"}`];
    if (s["Cushioning"]) parts.push(`cushioning ${s["Cushioning"]}`);
    if (s["Cocok untuk"]) parts.push(`dirancang untuk ${s["Cocok untuk"]}`);
    return `${parts.join(" dengan ")}.`;
  }
  const parts = [`${p.name} ditenagai ${s["Chipset"] ?? "chipset andal"}`];
  if (s["Layar"]) parts.push(`layar ${s["Layar"]}`);
  if (s["Baterai"]) parts.push(`baterai ${s["Baterai"]}`);
  return `${parts.join(", ")}.`;
}

export function getComparison(slug: string) {
  return comparisons.find((c) => c.slug === slug);
}

export function comparisonsByCategory(category: CategoryId) {
  return comparisons.filter((c) => c.category === category);
}

export function buildVerdict(
  nameA: string,
  nameB: string,
  specs: Array<{ label: string; scoreA?: number | undefined; scoreB?: number | undefined }> | undefined,
) {
  const list = specs ?? [];
  let menang = 0, seri = 0, kalah = 0;
  for (const s of list) {
    const v = specVerdict(s.scoreA, s.scoreB);
    if (v === "Menang: Produk A") menang++;
    else if (v === "Menang: Produk B") kalah++;
    else seri++;
  }
  return { menang, seri, kalah, totalSpecs: list.length };
}

export function overallVerdict(nameA: string, nameB: string, scoreA: number, scoreB: number) {
  const pemenang = scoreA > scoreB ? nameA : scoreB > scoreA ? nameB : "Seimbang";
  const gap = Math.abs(scoreA - scoreB);
  const gapWord = gap === 0 ? "sama kuat" : gap <= 3 ? "beda tipis" : gap <= 7 ? "beda jelas" : "beda jauh";
  const message = scoreA === scoreB ? `Hasilnya seimbang — ${nameA} dan ${nameB} sama kuat.` : `${pemenang} unggul ${gap} poin (${gapWord}, skor ${scoreA} vs ${scoreB}).`;
  return { pemenang, gap, gapWord, message };
}

export function getLearnItem(slug: string) {
  return learnItems.find((i) => i.slug === slug);
}

export function buildDynamicComparison(productA: Product, productB: Product) {
  const specEntries = [...Object.entries(productA.specs), ...Object.entries(productB.specs).filter(([k]) => !(k in productA.specs)).map(([k, v]) => [k, v])];
  return specEntries.map(([label, valueA]) => {
    const valueB = productB.specs[label as keyof typeof productB.specs];
    const scoreA = productA.ratings[label as keyof typeof productA.ratings];
    const scoreB = productB.ratings[label as keyof typeof productB.ratings];
    return { label, a: valueA ?? "-", b: valueB ?? "-", scoreA, scoreB };
  });
}

export function resolveProductVariant(product: Product, picks: VariantPicks): Product {
  if (!product.variants || product.variants.length === 0) return product;
  let variantDesc = "";
  let variantSigStr = "";
  for (const group of product.variants) {
    const pick = picks[group.key];
    if (pick !== undefined && pick !== null) {
      const option = group.options[pick];
      if (option) {
        const part = `${group.label}: ${option.value}`;
        variantDesc = variantDesc ? `${variantDesc}; ${part}` : part;
        const specKey = group.key;
        if (specKey && product.specs) product.specs[specKey] = option.value;
        variantSigStr = variantSigStr ? `${variantSigStr},${group.key}=${option.value}` : `${group.key}=${option.value}`;
      }
    }
  }
  const resolved = { ...product };
  if (variantDesc) resolved.variantDesc = variantDesc;
  if (variantSigStr) resolved.variantSig = variantSigStr;
  return resolved;
}

export function variantPicksFromParams(params: Record<string, string | string[] | undefined>, prefix: string, baseProduct: Product): VariantPicks {
  const picks: VariantPicks = {};
  if (!baseProduct.variants || baseProduct.variants.length === 0) return picks;
  for (const group of baseProduct.variants) {
    const key = `${prefix}_${group.key}`;
    const raw = params[key];
      if (raw !== undefined) {
      const strVal = typeof raw === "string" ? raw : Array.isArray(raw) && raw[0] ? raw[0] : undefined;
      if (strVal) {
        const n = parseInt(strVal, 10);
        if (!isNaN(n) && n >= 0 && n < group.options.length) picks[group.key] = n;
      }
    }
  }
  return picks;
}

export function variantSig(picks: VariantPicks): string {
  if (!picks) return "";
  return Object.entries(picks).filter(([_, idx]) => idx !== undefined && idx !== null && idx !== 0).map(([k, v]) => `${k}=${v}`).join(",");
}

export function parseVariantSig(sig: string): VariantPicks {
  if (!sig) return {};
  const picks: VariantPicks = {};
  for (const part of sig.split(",")) {
    const [key, val] = part.split("=", 2);
    if (key && val) {
      const n = parseInt(val, 10);
      if (!isNaN(n)) picks[key] = n;
    }
  }
  return picks;
}

export const setCatalogMirror = (_p?: Product[]) => {};