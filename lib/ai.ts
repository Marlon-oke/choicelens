import type { CategoryId } from "./data";

const SPEC_LABELS: Record<CategoryId, string[]> = {
  smartphones: [
    "Chipset",
    "RAM",
    "Kamera utama",
    "Kamera zoom",
    "Layar",
    "Baterai",
    "Berat",
    "Ketahanan",
    "Software",
  ],
  laptops: [
    "Chipset",
    "RAM",
    "GPU",
    "Penyimpanan",
    "Layar",
    "Baterai",
    "Berat",
    "Ports",
    "Sistem operasi",
  ],
  shoes: ["Upper", "Cushioning", "Court feel", "Berat", "Cocok untuk"],
};

export interface ProductDraft {
  name: string;
  brand: string;
  category: CategoryId;
  img: string;
  score: number;
  keywords: string;
  strengths: string[];
  specs: Record<string, string>;
  ratings: Record<string, number>;
}

export interface DraftInput {
  name: string;
  brand: string;
  category: CategoryId;
}

function geminiModel(): string {
  return process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
}

function openRouterUrl(): string {
  return process.env.OPENROUTER_URL ?? "https://openrouter.ai/api/v1/chat/completions";
}

function openRouterModel(): string {
  return process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";
}

function stripFences(s: string): string {
  const t = s.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return m ? m[1].trim() : t;
}

function buildPrompt(input: DraftInput): { system: string; user: string } {
  const labels = SPEC_LABELS[input.category];
  const system =
    "Kamu asisten data katalog ChoiceLens (Bahasa Indonesia). " +
    "Jawab HANYA dengan satu objek JSON valid, tanpa penjelasan, tanpa markdown fence. " +
    "Skor 0-100 realistis dibanding produk sekelas di dunia nyata.";
  const user = [
    `Buatkan data produk: nama="${input.name}", brand="${input.brand}", kategori="${input.category}".`,
    `Format JSON persis: {"score": number, "keywords": "...", "strengths": ["...", "...", "..."], "specs": {...}, "ratings": {...}}`,
    `- strengths: 3 kalimat pendek Bahasa Indonesia ("Butuh ..."/"Suka ..."/"Kamu ...").`,
    `- keywords: kata kunci spasi-dipisah (nama, brand, spek inti).`,
    `- specs: HANYA pakai label berikut: ${labels.join(", ")}. Isi teks spek ASLI produk ini (kapasitas, ukuran, tipe).`,
    `- ratings: angka 0-100 untuk SETIAP label specs di atas, realistis vs kompetitor sekelas.`,
    `- score: skor total 0-100 (rata-rata tertimbang kewajaran).`,
  ].join("\n");
  return { system, user };
}

function validateDraft(input: DraftInput, parsed: Record<string, unknown>): ProductDraft {
  const labels = SPEC_LABELS[input.category];
  const score = Number(parsed.score);
  const specs = parsed.specs as Record<string, string>;
  const ratings = parsed.ratings as Record<string, number>;
  const strengths = parsed.strengths as string[];
  if (!Number.isFinite(score) || !specs || typeof specs !== "object" || !ratings || !Array.isArray(strengths)) {
    throw new Error("Struktur jawaban AI tidak lengkap. Coba generate ulang.");
  }
  const cleanSpecs: Record<string, string> = {};
  const cleanRatings: Record<string, number> = {};
  for (const label of labels) {
    if (typeof specs[label] === "string" && specs[label].trim()) {
      cleanSpecs[label] = specs[label].trim();
    }
    const r = Number(ratings[label]);
    if (Number.isFinite(r)) cleanRatings[label] = Math.max(0, Math.min(100, Math.round(r)));
  }
  if (Object.keys(cleanSpecs).length === 0) {
    throw new Error("AI tidak memberikan spek yang dikenali. Coba generate ulang.");
  }

  return {
    name: input.name,
    brand: input.brand,
    category: input.category,
    img: "",
    score: Math.max(0, Math.min(100, Math.round(score))),
    keywords: String(parsed.keywords ?? `${input.name} ${input.brand}`.toLowerCase()),
    strengths: strengths.filter((s) => typeof s === "string" && s.trim()).slice(0, 5),
    specs: cleanSpecs,
    ratings: cleanRatings,
  };
}

async function generateViaGemini(input: DraftInput): Promise<Record<string, unknown>> {
  const key = process.env.GEMINI_API_KEY as string;
  const { system, user } = buildPrompt(input);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${encodeURIComponent(key)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch {
    throw new Error("Tidak bisa menghubungi Gemini. Cek koneksi internet.");
  }
  if (!res.ok) {
    if (res.status === 400) throw new Error("API key Gemini salah/tidak valid (400).");
    if (res.status === 429) throw new Error("Rate limit Gemini, coba lagi sebentar (429).");
    const txt = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!content) throw new Error("AI tidak mengembalikan jawaban.");
  try {
    return JSON.parse(stripFences(content)) as Record<string, unknown>;
  } catch {
    throw new Error("Jawaban AI bukan JSON valid. Coba generate ulang.");
  }
}

async function generateViaOpenRouter(
  input: DraftInput,
  key: string,
): Promise<Record<string, unknown>> {
  const { system, user } = buildPrompt(input);
  let res: Response;
  try {
    res = await fetch(openRouterUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
        "X-Title": "ChoiceLens Admin",
      },
      body: JSON.stringify({
        model: openRouterModel(),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });
  } catch {
    throw new Error("Tidak bisa menghubungi OpenRouter. Cek koneksi internet.");
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error("API key OpenRouter salah/tidak valid (401).");
    if (res.status === 402) throw new Error("Kredit/limit OpenRouter habis (402).");
    if (res.status === 429) throw new Error("Rate limit OpenRouter, coba lagi sebentar (429).");
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenRouter error ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("AI tidak mengembalikan jawaban.");
  try {
    return JSON.parse(stripFences(content)) as Record<string, unknown>;
  } catch {
    throw new Error("Jawaban AI bukan JSON valid. Coba generate ulang.");
  }
}

export async function generateProductDraft(input: DraftInput): Promise<ProductDraft> {
  // Prioritas: Gemini langsung (GEMINI_API_KEY). Kalau tidak ada, pakai OpenRouter.
  if (process.env.GEMINI_API_KEY) {
    return validateDraft(input, await generateViaGemini(input));
  }
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY / OPENROUTER_API_KEY belum diisi di .env.local");
  }
  return validateDraft(input, await generateViaOpenRouter(input, key));
}
