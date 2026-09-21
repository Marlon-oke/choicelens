"use client";

export interface FilterOptions {
  brands: string[];
}

interface FilterBarProps {
  metaId: string;
  filterOptions: FilterOptions;
  brandFilter?: string;
  chipsetFilter?: string;
  osFilter?: string;
}

function buildUrl(
  metaId: string,
  values: { brand?: string },
): string {
  const params = new URLSearchParams();
  if (values.brand) params.set("brand", values.brand);
  const qs = params.toString();
  return qs ? `/category/${metaId}?${qs}` : `/category/${metaId}`;
}

export default function FilterBar({
  metaId,
  filterOptions,
  brandFilter,
}: FilterBarProps) {
  return (
    <>
      {/* Brand Filter Row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ flex: "1 1 200px", minWidth: 200, maxWidth: "calc(50% - 8px)" }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
            Brand
          </label>
          <select
            value={brandFilter || ""}
            onChange={(e) => {
              const val = e.target.value;
              window.location.href = buildUrl(metaId, {
                brand: val,
              });
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              marginTop: 4,
            }}
          >
            <option value="">Semua Brand</option>
            {filterOptions.brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {brandFilter && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {brandFilter && (
            <span style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
              Brand: {brandFilter}
              <a href={buildUrl(metaId, {})} style={{ marginLeft: 6, color: "#1e40af", textDecoration: "underline" }}>×</a>
            </span>
          )}
        </div>
      )}
    </>
  );
}