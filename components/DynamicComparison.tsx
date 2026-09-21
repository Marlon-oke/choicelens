import type { Product } from "@/lib/data";
import { buildDynamicComparison, buildVerdict, productBlurb } from "@/lib/data";
import SpecTable from "./SpecTable";
import ChooseBoxes from "./ChooseBoxes";
import VerdictMeter from "./VerdictMeter";
import WishlistButton from "./WishlistButton";
import BuyButtons from "./BuyButtons";

export default function DynamicComparison({
  productA,
  productB,
}: {
  productA: Product;
  productB: Product;
}) {
  const specs = buildDynamicComparison(productA, productB);
  const verdict = buildVerdict(
    productA.name,
    productB.name,
    specs,
  );

  return (
    <div>
      <div className="featured-products" style={{ marginBottom: 16 }}>
        <div className="featured-product">
          {productA.img ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={productA.img}
              alt={productA.name}
              style={{ width: "100%", height: 160, objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 160,
                display: "grid",
                placeItems: "center",
                background: "#f1f5f9",
                borderRadius: 10,
                fontSize: 40,
              }}
            >
            </div>
          )}
          <h3>{productA.name}</h3>
          <small>{productA.brand}</small>
          <strong>{productA.score}/100</strong>
          <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.7, margin: "8px 0 0" }}>
            {productBlurb(productA)}
          </p>
          <BuyButtons links={productA.affiliate} />
          <div style={{ marginTop: 8 }}>
            <WishlistButton productId={productA.id} />
          </div>
        </div>
        <div className="big-vs">VS</div>
        <div className="featured-product">
          {productB.img ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={productB.img}
              alt={productB.name}
              style={{ width: "100%", height: 160, objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 160,
                display: "grid",
                placeItems: "center",
                background: "#f1f5f9",
                 borderRadius: 10,
                 fontSize: 40,
}}
              >
              </div>
            )}
            <h3>{productB.name}</h3>
            <small>{productB.brand}</small>
            <strong>{productB.score}/100</strong>
            <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.7, margin: "8px 0 0" }}>
              {productBlurb(productB)}
            </p>
            <BuyButtons links={productB.affiliate} />
          <div style={{ marginTop: 8 }}>
            <WishlistButton productId={productB.id} />
          </div>
        </div>
      </div>

      <VerdictMeter
        nameA={productA.name}
        nameB={productB.name}
        menang={verdict.menang}
        seri={verdict.seri}
        kalah={verdict.kalah}
        total={verdict.totalSpecs}
        scoreA={productA.score}
        scoreB={productB.score}
      />

      <SpecTable
        specs={specs}
        nameA={productA.name}
        nameB={productB.name}
      />
      <div style={{ marginTop: 16 }}>
        <ChooseBoxes
          nameA={productA.name}
          nameB={productB.name}
          notesA={productA.strengths}
          notesB={productB.strengths}
        />
      </div>
    </div>
  );
}