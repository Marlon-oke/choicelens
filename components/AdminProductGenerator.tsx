"use client";

import { useActionState, useState } from "react";
import {
  adminGenerateDraft,
  adminSaveProduct,
  type ActionState,
} from "@/lib/actions";
import type { ProductDraft } from "@/lib/ai";

interface Edit extends ProductDraft {
  strengthsText: string;
  specsText: string;
  ratingsText: string;
  affiliateText: string;
}

const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const label: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

function toEdit(d: ProductDraft): Edit {
  return {
    ...d,
    strengthsText: d.strengths.join("\n"),
    specsText: JSON.stringify(d.specs, null, 2),
    ratingsText: JSON.stringify(d.ratings, null, 2),
    affiliateText: "",
  };
}

export interface InitialProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  img: string;
  score: number;
  keywords: string;
  strengths: string[];
  specs: Record<string, string>;
  ratings: Record<string, number>;
  affiliate: Array<{ label: string; url: string }>;
}

export default function AdminProductGenerator({ initial }: { initial?: InitialProduct }) {
  const [genState, genAction, genPending] = useActionState<ActionState, FormData>(
    adminGenerateDraft,
    {},
  );
  const [saveState, saveAction, savePending] = useActionState<ActionState, FormData>(
    adminSaveProduct,
    {},
  );
  const [seenJson, setSeenJson] = useState("");
  const [edit, setEdit] = useState<Edit | null>(() =>
    initial
      ? {
          name: initial.name,
          brand: initial.brand,
          category: initial.category as Edit["category"],
          img: initial.img,
          score: initial.score,
          keywords: initial.keywords,
          strengths: initial.strengths,
          specs: initial.specs,
          ratings: initial.ratings,
          strengthsText: initial.strengths.join("\n"),
          specsText: JSON.stringify(initial.specs, null, 2),
          ratingsText: JSON.stringify(initial.ratings, null, 2),
          affiliateText: (initial.affiliate ?? []).map((a) => `${a.label} | ${a.url}`).join("\n"),
        }
      : null,
  );

  if (genState.draftJson && genState.draftJson !== seenJson) {
    setSeenJson(genState.draftJson);
    try {
      setEdit(toEdit(JSON.parse(genState.draftJson) as ProductDraft));
    } catch {
      setEdit(null);
    }
  }

  const set = (patch: Partial<Edit>) => setEdit((e) => (e ? { ...e, ...patch } : e));

  let jsonError = "";
  if (edit) {
    try {
      const s = JSON.parse(edit.specsText) as unknown;
      const r = JSON.parse(edit.ratingsText) as unknown;
      if (!s || typeof s !== "object" || Array.isArray(s)) jsonError = "Specs bukan objek JSON.";
      else if (!r || typeof r !== "object" || Array.isArray(r)) jsonError = "Ratings bukan objek JSON.";
    } catch {
      jsonError = "Specs/Ratings bukan JSON valid.";
    }
  }

  return (
    <div>
      <form
        action={genAction}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 10,
          alignItems: "end",
        }}
      >
        <label style={label}>
          Nama produk
          <input name="name" required placeholder="mis. Galaxy Z Flip 6" style={input} />
        </label>
        <label style={label}>
          Brand
          <input name="brand" required placeholder="mis. Samsung" style={input} />
        </label>
        <label style={label}>
          Kategori
          <select name="category" style={input} defaultValue="smartphones">
            <option value="smartphones">Smartphones</option>
            <option value="laptops">Laptops</option>
            <option value="shoes">Basketball Shoes</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={genPending}
          style={{
            background: "#7c3aed",
            color: "#fff",
            border: 0,
            borderRadius: 10,
            padding: "12px",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {genPending ? "AI menulis…" : "✨ Generate dari AI"}
        </button>
      </form>
      {genState.message && (
        <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>{genState.message}</p>
      )}
      <p style={{ fontSize: 11, color: "#64748b", margin: "8px 0 0" }}>
        Memakai Gemini AI (GEMINI_API_KEY sudah terpasang). Cek pratinjau baik-baik sebelum simpan.
      </p>

      {edit && (
        <form
          action={saveAction}
          style={{
            marginTop: 16,
            background: "#faf5ff",
            border: "1px solid #ddd6fe",
            borderRadius: 12,
            padding: 16,
            display: "grid",
            gap: 10,
          }}
        >
          <b style={{ fontSize: 13 }}>
            {initial
              ? `Edit produk: ${initial.name} (id: ${initial.id}) — varian yang sudah ada tidak diubah`
              : "Pratinjau AI — periksa & edit sebelum simpan"}
          </b>
          {initial && (
            <>
              <input type="hidden" name="id" value={initial.id} />
              <a href="/admin/products" style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}>
                ← Batal edit / tambah baru
              </a>
            </>
          )}
          <input type="hidden" name="name" value={edit.name} />
          <input type="hidden" name="brand" value={edit.brand} />
          <input type="hidden" name="category" value={edit.category} />
          <input type="hidden" name="specsJson" value={edit.specsText} />
          <input type="hidden" name="ratingsJson" value={edit.ratingsText} />
          <input type="hidden" name="keywords" value={edit.keywords} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={label}>
              Nama
              <input value={edit.name} onChange={(e) => set({ name: e.target.value })} style={input} />
            </label>
            <label style={label}>
              Brand
              <input value={edit.brand} onChange={(e) => set({ brand: e.target.value })} style={input} />
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 10 }}>
            <label style={label}>
              Skor (0–100)
              <input
                type="number"
                min={0}
                max={100}
                value={edit.score}
                onChange={(e) => set({ score: Number(e.target.value) })}
                style={input}
              />
            </label>
            <label style={label}>
              Foto (file di public/ atau URL, boleh kosong)
              <input
                value={edit.img}
                onChange={(e) => set({ img: e.target.value })}
                placeholder="/nama-file.jpg"
                style={input}
              />
            </label>
            <label style={label}>
              Keywords
              <input
                value={edit.keywords}
                onChange={(e) => set({ keywords: e.target.value })}
                style={input}
              />
            </label>
          </div>
          <label style={label}>
            Kelebihan (satu per baris)
            <textarea
              value={edit.strengthsText}
              onChange={(e) => set({ strengthsText: e.target.value })}
              rows={3}
              style={{ ...input, fontFamily: "inherit" }}
            />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={label}>
              Specs (JSON)
              <textarea
                value={edit.specsText}
                onChange={(e) => set({ specsText: e.target.value })}
                rows={8}
                style={{ ...input, fontFamily: "monospace", fontSize: 12 }}
              />
            </label>
            <label style={label}>
              Ratings (JSON, 0–100)
              <textarea
                value={edit.ratingsText}
                onChange={(e) => set({ ratingsText: e.target.value })}
                rows={8}
                style={{ ...input, fontFamily: "monospace", fontSize: 12 }}
              />
            </label>
          </div>
          {initial && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {edit.img ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={edit.img}
                  alt={edit.name}
                  style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0" }}
                />
              ) : (
                <div style={{ width: 72, height: 72, display: "grid", placeItems: "center", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 28, color: "#94a3b8" }}>
                </div>
              )}
              <label style={{ ...label, flex: 1, minWidth: 200 }}>
                Ganti foto (kosongkan = tidak berubah, maks 5 MB)
                <input
                  type="file"
                  name="photo"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  style={{ ...input, padding: 8 }}
                />
              </label>
            </div>
          )}
          <input type="hidden" name="score" value={String(edit.score)} />
          <input type="hidden" name="img" value={edit.img} />
          <input type="hidden" name="strengths" value={edit.strengthsText} />
          <label style={label}>
            Link affiliate
            <textarea
              name="affiliate"
              value={edit.affiliateText}
              onChange={(e) => set({ affiliateText: e.target.value })}
              rows={2}
              placeholder={"Shopee | https://shopee.co.id/...\nTokopedia | https://tokopedia.com/..."}
              style={{ ...input, fontFamily: "inherit", fontSize: 12 }}
            />
          </label>
          {jsonError && (
            <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, margin: 0 }}>{jsonError}</p>
          )}
          {saveState.message && (
            <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, margin: 0 }}>
              {saveState.message}
            </p>
          )}
          {saveState.notice && (
            <p style={{ fontSize: 12, color: "#166534", fontWeight: 700, margin: 0 }}>
              {saveState.notice}
            </p>
          )}
          <button
            type="submit"
            disabled={savePending || !!jsonError}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: 0,
              borderRadius: 10,
              padding: "12px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {savePending ? "Menyimpan…" : "💾 Simpan ke Katalog"}
          </button>
        </form>
      )}
    </div>
  );
}
