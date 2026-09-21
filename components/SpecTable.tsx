"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SpecRow } from "@/lib/data";
import { specGlossary, specVerdict, getLearnItem, findProductIdByName, getProduct, productBlurb } from "@/lib/data";
import BuyButtons from "./BuyButtons";

interface SpecTableProps {
  specs: SpecRow[];
  nameA: string;
  nameB: string;
}

const WIN_BG = "#43418f";
const TRACK = "#e5e7eb";

function getLearnSlugs(label: string): string[] {
  return specGlossary[label]?.learnSlugs ?? [];
}

function learnTitle(slug: string): string {
  return getLearnItem(slug)?.title ?? slug;
}

function ScoreBadge({ score, win }: { score: number | null; win: boolean }) {
  if (score === null) {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#94a3b8",
          border: "1px solid #e2e8f0",
          borderRadius: 6,
          padding: "3px 8px",
          minWidth: 34,
          textAlign: "center",
        }}
      >
        -
      </span>
    );
  }
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 800,
        color: win ? "#fff" : "#475569",
        background: win ? WIN_BG : "#fff",
        border: `1px solid ${win ? WIN_BG : "#cbd5e1"}`,
        borderRadius: 6,
        padding: "3px 8px",
        minWidth: 34,
        textAlign: "center",
      }}
    >
      {score}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div
      style={{
        height: 5,
        borderRadius: 3,
        background: TRACK,
        overflow: "hidden",
        marginTop: 6,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, score))}%`,
          background: WIN_BG,
          borderRadius: 3,
        }}
      />
    </div>
  );
}

export default function SpecTable({
  specs,
  nameA,
  nameB,
}: SpecTableProps) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const router = useRouter();

  // Hitung verdict
  let menang = 0,
    seri = 0,
    kalah = 0;
  for (const s of specs) {
    const v = specVerdict(s.scoreA, s.scoreB);
    if (v === "A") menang++;
    else if (v === "B") kalah++;
    else seri++;
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          gap: 14,
        }}
      >
        {specs.map((s) => {
          const scoreA = s.scoreA ?? 0;
          const scoreB = s.scoreB ?? 0;
          const verdict = specVerdict(s.scoreA, s.scoreB);
          const aScore = scoreA > 0 ? scoreA : null;
          const bScore = scoreB > 0 ? scoreB : null;
          const aText = s.a ?? "-";
          const bText = s.b ?? "-";
          const glossary = specGlossary[s.label]?.simple ?? "";
          const slugs = getLearnSlugs(s.label);
          const opened = openLabel === s.label;

          return (
            <div
              key={s.label}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <b style={{ fontSize: 14, color: "#0f172a" }}>{s.label}</b>
                {glossary && (
                  <span
                    role="button"
                    tabIndex={0}
                    title="Penjelasan"
                    onClick={() => setOpenLabel((p) => (p === s.label ? null : s.label))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenLabel((p) => (p === s.label ? null : s.label));
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      fontSize: 11,
                      color: "#2563eb",
                      fontWeight: 700,
                    }}
                  >
                    ⓘ
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                {aText} <span style={{ color: "#94a3b8" }}>vs</span> {bText}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  color: verdict === "Seri" ? "#64748b" : "#166534",
                }}
              >
                {verdict === "Seri"
                  ? `= Seri — bedanya tipis (${scoreA} vs ${scoreB})`
                  : `✓ Menang: ${verdict === "A" ? nameA : nameB} (${Math.max(scoreA, scoreB)} vs ${Math.min(scoreA, scoreB)})`}
              </div>
              {opened && glossary && (
                <div style={{ marginTop: 6, fontSize: 11, color: "#475569", lineHeight: 1.5 }}>
                  <span>{glossary}</span>
                  {slugs.length > 0 && (
                    <div style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {slugs.map((slug) => (
                        <span
                          key={slug}
                          style={{ cursor: "pointer", color: "#2563eb", fontWeight: 700, fontSize: 10 }}
                          onClick={() => router.push(`/learn/${slug}`)}
                        >
                          → Pelajari {learnTitle(slug)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{nameA}</span>
                  <ScoreBadge score={aScore} win={verdict === "A"} />
                </div>
                <ScoreBar score={scoreA} />
              </div>

              <div style={{ marginTop: 10 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{nameB}</span>
                  <ScoreBadge score={bScore} win={verdict === "B"} />
                </div>
                <ScoreBar score={scoreB} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Baris verdict singkat di bawah */}
      <div
        style={{
          marginTop: 14,
          padding: "10px 14px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          fontSize: 11,
          color: "#334155",
        }}
      >
        <b>Verdict:</b> {nameA} menang {menang} dari {specs.length} spek {seri} seri {kalah} kalah{" "}
        {menang > kalah ? `→ Pilih ${nameA}` : kalah > menang ? `→ Pilih ${nameB}` : "→ Seimbang"}
      </div>

      <ExtraInfo nameA={nameA} nameB={nameB} />
    </div>
  );
}

function ExtraInfo({ nameA, nameB }: { nameA: string; nameB: string }) {
  const names = [nameA, nameB];
  const infos = names.map((n) => {
    const id = findProductIdByName(n);
    return id ? getProduct(id) : undefined;
  });
  if (!infos[0] && !infos[1]) return null;

  return (
    <div style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: 16, letterSpacing: -0.4, margin: "0 0 10px" }}>
        Informasi tambahan
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          gap: 14,
        }}
      >
        {infos.map((p, i) => {
          if (!p) return null;
          const specEntries = Object.entries(p.specs ?? {});
          return (
            <div
              key={p.id}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 800, color: "#2563eb", letterSpacing: "0.08em" }}>
                {i === 0 ? "PRODUK A" : "PRODUK B"}
              </div>
              <b style={{ fontSize: 14, color: "#0f172a", display: "block", marginTop: 2 }}>
                {p.name}
              </b>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                {p.brand} · Skor {p.score}/100
              </div>
              <p style={{ fontSize: 11, color: "#334155", lineHeight: 1.7, margin: "8px 0 0" }}>
                {productBlurb(p)}
              </p>
              <BuyButtons links={p.affiliate} />

              {p.strengths.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                    ✓ Kelebihan
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: "#334155", lineHeight: 1.6 }}>
                    {p.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {specEntries.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                    ▤ Spesifikasi lengkap
                  </div>
                  <dl style={{ margin: 0, fontSize: 11, lineHeight: 1.6 }}>
                    {specEntries.map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          padding: "3px 0",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        <dt style={{ color: "#64748b" }}>{k}</dt>
                        <dd style={{ margin: 0, color: "#0f172a", fontWeight: 700, textAlign: "right" }}>
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
