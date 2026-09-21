import type { CSSProperties } from "react";
import { overallVerdict, findProductIdByName, getProduct, productsByCategory } from "@/lib/data";

interface VerdictMeterProps {
  nameA: string;
  nameB: string;
  menang: number;
  seri: number;
  kalah: number;
  total: number;
  scoreA: number;
  scoreB: number;
}

const FILL = "#22c533";
const TRACK = "#e9e9e9";
const SCORE_COLOR = "#a020f0";

function Bar({
  name,
  sub,
  score,
  leadPct,
}: {
  name: string;
  sub: string;
  score: number;
  leadPct: string | null;
}) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div
      style={{
        position: "relative",
        border: "1px solid #c9c9c9",
        borderRadius: 6,
        background: TRACK,
        overflow: "hidden",
        minHeight: 52,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          background: FILL,
          borderRadius: 4,
          padding: "8px 10px",
          minHeight: 52,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0b3d12", whiteSpace: "nowrap" }}>
          {name}
        </div>
        {sub && (
          <div style={{ fontSize: 10, color: "#0b3d12", opacity: 0.75, whiteSpace: "nowrap" }}>
            {sub}
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 13,
          fontWeight: 800,
          color: SCORE_COLOR,
          whiteSpace: "nowrap",
        }}
      >
        {score}
        {leadPct && <span style={{ fontSize: 11 }}> {leadPct}</span>}
      </div>
    </div>
  );
}

export default function VerdictMeter({
  nameA,
  nameB,
  menang,
  seri,
  kalah,
  total,
  scoreA,
  scoreB,
}: VerdictMeterProps) {
  // Pemenang overall ikut skor total — tidak pernah kontradiksi headline.
  const overall = overallVerdict(nameA, nameB, scoreA, scoreB);
  const seimbang = overall.pemenang === "Seimbang";
  const loser = overall.pemenang === nameA ? nameB : nameA;

  const gap = Math.abs(scoreA - scoreB);
  const winnerScore = Math.max(scoreA, scoreB);
  const loserScore = Math.min(scoreA, scoreB);
  const pctLead = loserScore > 0 ? ((winnerScore - loserScore) / loserScore) * 100 : 0;
  const pctText = `+${pctLead.toFixed(1)}%`;
  const gapWord = gap === 0 ? "sama kuat" : gap <= 3 ? "beda tipis" : gap <= 7 ? "beda jelas" : "beda jauh";

  // Rincian spek apa adanya (boleh berbeda arah dengan pemenang overall).
  const specLead =
    menang === kalah
      ? `imbang ${menang}-${kalah}`
      : menang > kalah
        ? `${nameA} ${menang}-${kalah}`
        : `${nameB} ${kalah}-${menang}`;

  // Saran "pilih yang mana" pakai bahasa sehari-hari dari data strengths.
  const strengthsOf = (name: string): string[] => {
    const id = findProductIdByName(name);
    const p = id ? getProduct(id) : undefined;
    return p?.strengths.slice(0, 2) ?? [];
  };
  const plusA = strengthsOf(nameA);
  const plusB = strengthsOf(nameB);

  // Marker produk lain se-kategori di sepanjang skala (seperti contoh:
  // label nilai di atas/bawah bar). Dipilih renggang (beda ≥6 poin) supaya
  // tidak bertumpuk, maksimal 2 di atas (skor tertinggi) + 2 di bawah.
  const idA = findProductIdByName(nameA);
  const baseA = idA ? getProduct(idA) : undefined;
  const spaced = (baseA ? productsByCategory(baseA.category) : [])
    .filter((p) => p.name !== nameA && p.name !== nameB)
    .sort((x, y) => y.score - x.score)
    .filter(
      (p, _, arr) =>
        arr
          .slice(0, arr.indexOf(p))
          .every((q) => Math.abs(q.score - p.score) >= 6),
    );
  const markersTop = spaced.slice(0, 2);
  const markersBottom = spaced.slice(2).slice(-2);

  const markerStyle = (score: number): CSSProperties => ({
    position: "absolute",
    left: `${Math.min(88, Math.max(12, score))}%`,
    transform: "translateX(-50%)",
    fontSize: 9,
    fontWeight: 700,
    color: "#2563eb",
    whiteSpace: "nowrap",
    maxWidth: 96,
    overflow: "hidden",
    textOverflow: "ellipsis",
  });

  const headline = seimbang
    ? `Hasilnya seimbang — ${nameA} dan ${nameB} sama kuat.`
    : `Pemenangnya: ${overall.pemenang} (${gapWord}, skor ${scoreA} vs ${scoreB}).`;

  const detail = seimbang
    ? `Skor agregat sama ${scoreA} vs ${scoreB} dari ${total} spesifikasi (${seri} seri). Kalau bingung, pilih berdasarkan kecocokan di bawah.`
    : `${overall.pemenang} unggul ${gap} poin dari ${loser} (${pctText}). Per spek ${total} kategori: ${specLead}${seri > 0 ? `, ${seri} seri` : ""}.`;

  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>
        🏆 {seimbang ? "Seimbang" : overall.pemenang}
      </h2>
      <p style={{ fontSize: 13, color: "#334155", margin: "0 0 12px", lineHeight: 1.6 }}>{headline}</p>

      <div style={{ display: "grid", gap: 10 }}>
        {markersTop.length > 0 && (
          <div style={{ position: "relative", height: 26 }}>
            {markersTop.map((p) => (
              <span key={p.id} title={`${p.name}: ${p.score}`} style={{ ...markerStyle(p.score), bottom: 0 }}>
                <span style={{ display: "block", textAlign: "center" }}>{p.name}</span>
                <span
                  style={{
                    display: "block",
                    width: 1,
                    height: 10,
                    background: "#94a3b8",
                    margin: "1px auto 0",
                  }}
                />
              </span>
            ))}
          </div>
        )}
        <Bar
          name={nameA}
          sub={`Skor ${scoreA} dari 100`}
          score={scoreA}
          leadPct={!seimbang && scoreA >= scoreB ? pctText : null}
        />
        <Bar
          name={nameB}
          sub={`Skor ${scoreB} dari 100`}
          score={scoreB}
          leadPct={!seimbang && scoreB > scoreA ? pctText : null}
        />
        {markersBottom.length > 0 && (
          <div style={{ position: "relative", height: 26 }}>
            {markersBottom.map((p) => (
              <span key={p.id} title={`${p.name}: ${p.score}`} style={{ ...markerStyle(p.score), top: 0 }}>
                <span
                  style={{
                    display: "block",
                    width: 1,
                    height: 10,
                    background: "#94a3b8",
                    margin: "0 auto 1px",
                  }}
                />
                <span style={{ display: "block", textAlign: "center" }}>{p.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <p style={{ fontSize: 11, color: "#64748b", margin: "6px 0 0" }}>
        Makin panjang bar hijau = skor makin tinggi (maksimal 100).
      </p>

      <p style={{ fontSize: 13, lineHeight: 1.7, color: "#0f172a", margin: "14px 0 0" }}>{detail}</p>

      {(plusA.length > 0 || plusB.length > 0) && (
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {plusA.length > 0 && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#166534" }}>
                Pilih {nameA} kalau kamu:
              </div>
              <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 12, color: "#334155", lineHeight: 1.7 }}>
                {plusA.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {plusB.length > 0 && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#1d4ed8" }}>
                Pilih {nameB} kalau kamu:
              </div>
              <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 12, color: "#334155", lineHeight: 1.7 }}>
                {plusB.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
