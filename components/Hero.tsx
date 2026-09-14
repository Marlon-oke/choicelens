import type { FormEvent } from "react";
import type { CategoryId } from "@/lib/data";

interface HeroProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: (e: FormEvent) => void;
  onQuickCategory: (c: CategoryId) => void;
}

export default function Hero({
  query,
  onQueryChange,
  onSearch,
  onQuickCategory,
}: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          COMPARE <i>•</i> LEARN <i>•</i> CHOOSE
        </div>
        <h1>
          Pilih yang Tepat.
          <br />
          <span>Bukan yang Termahal.</span>
        </h1>
        <p className="hero-desc">
          ChoiceLens membantu kamu membandingkan produk teknologi dan mencari
          tahu material, teknologi, dan fitur yang benar-benar penting — dengan
          cara yang simpel.
        </p>

        <form className="search-box" onSubmit={onSearch}>
          <span className="search-icon">⌕</span>
          <input
            id="searchInput"
            type="search"
            autoComplete="off"
            placeholder="Search products, technologies, or materials..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          <button type="submit">→</button>
        </form>

        <div className="quick">
          <span>Quick categories:</span>
          <div className="pills">
            <button
              type="button"
              onClick={() => onQuickCategory("smartphones")}
            >
              ▯ Smartphones
            </button>
            <button type="button" onClick={() => onQuickCategory("laptops")}>
              ▱ Laptops
            </button>
            <button type="button" onClick={() => onQuickCategory("shoes")}>
              ⌁ Basketball Shoes
            </button>
          </div>
        </div>
      </div>

      <div className="hero-visual" aria-label="Featured products">
        <div className="orb orb-a"></div>
        <div className="orb orb-b"></div>

        <div className="floating-note">
          Better
          <br />
          Decisions <span>↴</span>
        </div>

        <article className="product-float phone-float">
          <div className="mini-label">iPhone 16 Pro</div>
          <div className="mini-meta">A18 Pro · 48MP · 120Hz</div>
          <div className="phone-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/apple-iphone-16-pro-grey.jpg" alt="iphone16pro" />
          </div>
        </article>

        <article className="product-float laptop-float">
          <div className="mini-label">MacBook Air M3</div>
          <div className="mini-meta">M3 Chip · 13.6″ · All-day Battery</div>
          <div className="laptop-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/apple-macbook-air-m3.jpeg" alt="macbook air m3" />
          </div>
        </article>

        <article className="product-float shoe-float">
          <div className="mini-label">Nike LeBron 22</div>
          <div className="mini-meta">Performance · Cushioning · Durability</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="shoe-art" src="/lebron-22.png" alt="Nike LeBron 22" />
        </article>

        <div className="data-note">
          <strong>✓</strong>
          <div>
            <b>Real Data.</b>
            <br />
            Clear Insights.
            <br />
            Better Choices.
          </div>
        </div>
      </div>
    </section>
  );
}
