import type { CSSProperties } from "react";
import { featuredMetrics } from "@/lib/data";

export default function FeaturedComparison() {
  return (
    <section className="section featured">
      <div className="featured-label">✦ FEATURED COMPARISON</div>
      <div className="featured-head">
        <h2>
          iPhone 16 Pro <span>vs</span> Galaxy S25 Ultra
        </h2>
        <p>Dua flagship terbaru, dua pendekatan berbeda. Mana yang lebih cocok untukmu?</p>
      </div>

      <div className="featured-grid">
        <div className="featured-products">
          <div className="featured-product">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/apple-iphone-16-pro-grey.jpg" alt="iphone16pro" />
            <h3>iPhone 16 Pro</h3>
            <small>Apple</small>
            <strong>▣ 92/100</strong>
            <label>ChoiceLens Score</label>
          </div>
          <div className="big-vs">VS</div>
          <div className="featured-product">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/samsung-galaxy-s25-ultra-grey.jpg" alt="samsungs25" />
            <h3>Galaxy S25 Ultra</h3>
            <small>Samsung</small>
            <strong>▣ 89/100</strong>
            <label>ChoiceLens Score</label>
          </div>
        </div>

        <div className="metrics">
          {featuredMetrics.map((m) => (
            <div className="metric" key={m.label}>
              <div>
                {m.icon} <b>{m.label}</b>
              </div>
              <div className="metric-line">
                <span>iPhone 16 Pro</span>
                <i style={{ "--score": `${m.a}%` } as CSSProperties}></i>
                <b>{m.a}</b>
              </div>
              <div className="metric-line">
                <span>Galaxy S25 Ultra</span>
                <i style={{ "--score": `${m.b}%` } as CSSProperties}></i>
                <b>{m.b}</b>
              </div>
            </div>
          ))}
        </div>

        <div className="choose-boxes">
          <div className="choose choose-a">
            <h3>✓ Choose iPhone 16 Pro if...</h3>
            <ul>
              <li>Kamu suka ekosistem Apple</li>
              <li>Butuh performa video terbaik</li>
              <li>Lebih suka ukuran yang compact</li>
            </ul>
          </div>
          <div className="choose choose-b">
            <h3>✓ Choose Galaxy S25 Ultra if...</h3>
            <ul>
              <li>Butuh zoom kamera yang lebih jauh</li>
              <li>Ingin S-Pen dan produktivitas lebih</li>
              <li>Lebih suka layar yang lebih besar</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
