import type { CategoryId } from "@/lib/data";

export default function CategoryGrid({
  onExplore,
}: {
  onExplore: (c: CategoryId) => void;
}) {
  return (
    <section className="section" id="categories">
      <div className="section-head">
        <div>
          <h2>Explore Categories</h2>
          <p>Temukan perbandingan, ulasan, dan panduan terbaik di setiap kategori.</p>
        </div>
      </div>

      <div className="category-grid">
        <article className="category-card category-phone">
          <div className="category-overlay">
            <span className="category-icon">▯</span>
            <h3>Smartphones</h3>
            <p>Bandingkan performa, kamera, baterai, dan fitur lainnya.</p>
            <button type="button" onClick={() => onExplore("smartphones")}>
              Explore →
            </button>
          </div>
        </article>
        <article className="category-card category-laptop">
          <div className="category-overlay">
            <span className="category-icon">▱</span>
            <h3>Laptops</h3>
            <p>
              Dari performa chip hingga daya tahan baterai, temukan yang terbaik
              untukmu.
            </p>
            <button type="button" onClick={() => onExplore("laptops")}>
              Explore →
            </button>
          </div>
        </article>
        <article className="category-card category-shoe">
          <div className="category-overlay">
            <span className="category-icon">⌁</span>
            <h3>Basketball Shoes</h3>
            <p>Cek material, teknologi, dan performa untuk setiap gaya bermain.</p>
            <button type="button" onClick={() => onExplore("shoes")}>
              Explore →
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
