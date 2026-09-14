import type { Comparison } from "@/lib/data";
import CompareCard from "./CompareCard";

export default function ComparisonGrid({
  items,
  onPlaceholder,
}: {
  items: Comparison[];
  onPlaceholder: () => void;
}) {
  return (
    <section className="section" id="comparisons">
      <div className="section-head">
        <div>
          <h2>Popular Comparisons</h2>
          <p>Perbandingan paling populer dari berbagai kategori.</p>
        </div>
        <a
          href="#"
          className="view-all"
          onClick={(e) => {
            e.preventDefault();
            onPlaceholder();
          }}
        >
          View All →
        </a>
      </div>

      <div className="comparison-grid">
        {items.map((c) => (
          <CompareCard
            key={c.slug}
            comparison={c}
            onPlaceholder={onPlaceholder}
          />
        ))}
      </div>
    </section>
  );
}
