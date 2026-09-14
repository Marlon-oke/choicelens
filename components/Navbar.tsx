"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  onSaved: () => void;
}

export default function Navbar({ onSaved }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const focusSearch = () => {
    document.getElementById("searchInput")?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="navbar">
      <Link className="brand" href="#">
        <Image
          className="brand-mark"
          src="/logo-choicelens.png"
          alt="ChoiceLens"
          width={33}
          height={35}
        />
        <span>
          Choice<span>Lens</span>
        </span>
      </Link>

      <nav
        className="nav-links"
        aria-label="Main navigation"
        data-open={open ? "true" : "false"}
        style={
          open
            ? {
                display: "flex",
                position: "absolute",
                top: 70,
                left: 0,
                right: 0,
                margin: "0 12px",
                padding: 18,
                flexDirection: "column",
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                boxShadow: "0 12px 30px rgba(15,23,42,.1)",
                gap: 16,
              }
            : undefined
        }
      >
        <a href="#categories">Smartphones</a>
        <a href="#categories">Laptops</a>
        <a href="#categories">Basketball Shoes</a>
        <a href="#comparisons">Compare</a>
        <a href="#learn">Learn</a>
      </nav>

      <div className="nav-actions">
        <button className="icon-btn" aria-label="Search" onClick={focusSearch}>
          ⌕
        </button>
        <button
          className="icon-btn saved-btn"
          aria-label="Saved"
          onClick={onSaved}
        >
          ♡
        </button>
        <button className="profile-btn" aria-label="Profile">
          M
        </button>
      </div>

      <button
        className="menu-btn"
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
      >
        ☰
      </button>
    </header>
  );
}
