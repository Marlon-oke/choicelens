import Link from "next/link";
import { COMPARE_COST, formatRp, TOKEN_PRICE_RP } from "@/lib/tokens";

export function LockedCompare({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        maxWidth: 520,
        margin: "24px auto",
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: "28px 24px",
        textAlign: "center",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#eff6ff",
          display: "grid",
          placeItems: "center",
          fontSize: 24,
          margin: "0 auto",
        }}
      >
        🔒
      </div>
      <div
        style={{
          display: "inline-block",
          fontSize: 9,
          fontWeight: 800,
          color: "#1d4ed8",
          background: "#dbeafe",
          borderRadius: 8,
          padding: "3px 10px",
          marginTop: 12,
          letterSpacing: "0.06em",
        }}
      >
        BUTUH LOGIN
      </div>
      <h2 style={{ fontSize: 17, margin: "8px 0 4px" }}>{title}</h2>
      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px" }}>{desc}</p>
      <p style={{ fontSize: 12, color: "#334155", fontWeight: 700 }}>
        Hasil lengkap butuh login — {COMPARE_COST} token per hasil.
      </p>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/login"
          style={{
            background: "#2563eb",
            color: "#fff",
            borderRadius: 10,
            padding: "10px 22px",
            fontSize: 12,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Masuk
        </Link>
        <Link
          href="/register"
          style={{
            background: "#eff6ff",
            color: "#2563eb",
            borderRadius: 10,
            padding: "10px 22px",
            fontSize: 12,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Daftar gratis
        </Link>
      </div>
    </div>
  );
}

export function EmptyTokens({ balance }: { balance: number }) {
  return (
    <div
      style={{
        maxWidth: 520,
        margin: "24px auto",
        background: "#fffbeb",
        border: "1px solid #fde68a",
        borderRadius: 16,
        padding: "28px 24px",
        textAlign: "center",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)",
      }}
    >
      <div style={{ fontSize: 28 }}>🎟</div>
      <h2 style={{ fontSize: 16, margin: "8px 0 4px" }}>Token Habis</h2>
      <p style={{ fontSize: 12, color: "#92400e", margin: "0 0 4px" }}>
        Sisa {balance} token — hasil ini butuh {COMPARE_COST} token. Topup {formatRp(TOKEN_PRICE_RP)}/token.
      </p>
      <div style={{ marginTop: 12 }}>
        <Link
          href="/topup"
          style={{
            background: "#2563eb",
            color: "#fff",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 12,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Topup Token →
        </Link>
      </div>
    </div>
  );
}

export function DbUnavailable() {
  return (
    <div
      style={{
        maxWidth: 520,
        margin: "24px auto",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 16,
        padding: "28px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 28 }}>🛠</div>
      <h2 style={{ fontSize: 16, margin: "8px 0 4px" }}>Database tidak terhubung</h2>
      <p style={{ fontSize: 12, color: "#92400e", margin: "0 0 4px" }}>
        Hasil perbandingan belum bisa dibuka karena server database tidak merespons
        (koneksi ECONNREFUSED ke MySQL). Jalankan <code>sudo /opt/lampp/lampp startmysql</code> lalu
        muat ulang halaman ini.
      </p>
    </div>
  );
}

export function TokenReceipt({
  freshCharge,
  balance,
  expiresAt,
}: {
  freshCharge: boolean;
  balance: number;
  expiresAt?: string | null;
}) {
  const validText =
    expiresAt && new Date(expiresAt).getTime() > Date.now()
      ? ` · berlaku s.d. ${new Date(expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
      : "";
  return (
    <div
      style={{
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 11,
        fontWeight: 700,
        color: "#166534",
        marginBottom: 12,
      }}
    >
      {freshCharge
        ? `🎟 2 token dipakai untuk membuka hasil ini · sisa ${balance} token${validText} · buka lagi kapan saja gratis`
        : `Sudah pernah dibuka — gratis · sisa ${balance} token${validText}`}
    </div>
  );
}

export function ExpiredTokens({ expiresAt }: { expiresAt?: string | null }) {
  return (
    <div
      style={{
        maxWidth: 520,
        margin: "24px auto",
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        borderRadius: 16,
        padding: "28px 24px",
        textAlign: "center",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)",
      }}
    >
      <div style={{ fontSize: 28 }}>⏳</div>
      <h2 style={{ fontSize: 16, margin: "8px 0 4px" }}>Masa Berlaku Token Habis</h2>
      <p style={{ fontSize: 12, color: "#92400e", margin: "0 0 4px" }}>
        {expiresAt
          ? `Tokenmu kedaluwarsa pada ${new Date(expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.`
          : "Akunmu belum punya masa berlaku token."}{" "}
        Topup 1× untuk memakai token selama 1 bulan penuh. Buka ulang yang pernah dibuka tetap gratis.
      </p>
      <div style={{ marginTop: 12 }}>
        <Link
          href="/topup"
          style={{
            background: "#2563eb",
            color: "#fff",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 12,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Topup 1 Bulan →
        </Link>
      </div>
    </div>
  );
}
