import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <Link className="brand" href="#">
        <Image
          className="footer-brand-mark"
          src="/logo-choicelens.png"
          alt="ChoiceLens"
          width={33}
          height={35}
        />
        <span>
          Choice<span>Lens</span>
        </span>
      </Link>
      <p>Real data. Clear insights. Better choices.</p>
      <div>© 2026 ChoiceLens</div>
    </footer>
  );
}
