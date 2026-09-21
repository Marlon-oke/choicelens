import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export default function PageHeader({
  crumbs,
  title,
  desc,
  action,
}: {
  crumbs: Crumb[];
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <nav
        aria-label="Breadcrumb"
        style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}
      >
        {crumbs.map((c, i) => (
          <span key={c.label}>
            {i > 0 && <span style={{ margin: "0 6px" }}>/</span>}
            {c.href ? (
              <Link
                href={c.href}
                style={{ color: "#2563eb", textDecoration: "none" }}
              >
                {c.label}
              </Link>
            ) : (
              <span style={{ color: "#475569" }}>{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="section-head" style={{ marginBottom: 0 }}>
        <div>
          <h2>{title}</h2>
          {desc && <p>{desc}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
