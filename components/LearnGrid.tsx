import { learnItems } from "@/lib/data";

export default function LearnGrid({
  onPlaceholder,
}: {
  onPlaceholder: () => void;
}) {
  return (
    <section className="section" id="learn">
      <div className="section-head">
        <div>
          <h2>More Than Just Specs</h2>
          <p>Pahami istilah, material, dan teknologi yang sering kamu temui.</p>
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

      <div className="learn-grid">
        {learnItems.map((item) => (
          <article className="learn-card" key={item.title}>
            {item.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={`learn-image ${item.artClass}`}
                src={item.img}
                alt={item.title}
              />
            ) : (
              <div className={`learn-image ${item.artClass}`}></div>
            )}
            <div className="learn-body">
              <span className="learn-icon">{item.icon}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPlaceholder();
                  }}
                >
                  Explain →
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
