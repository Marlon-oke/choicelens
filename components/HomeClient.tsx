"use client";

import { useMemo, useRef, type FormEvent } from "react";
import { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import ComparisonGrid from "./ComparisonGrid";
import CategoryGrid from "./CategoryGrid";
import LearnGrid from "./LearnGrid";
import FeaturedComparison from "./FeaturedComparison";
import Toast from "./Toast";
import { comparisons, type CategoryId } from "@/lib/data";

export default function HomeClient() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const scrollToComparisons = () => {
    document
      .querySelector("#comparisons")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) {
      setActiveCategory(null);
      notify("Ketik produk atau teknologi untuk mencari.");
      return;
    }
    setActiveCategory(null);
    const found = comparisons.filter((c) =>
      c.searchKeywords.includes(q),
    ).length;
    scrollToComparisons();
    notify(
      found ? `${found} comparison ditemukan.` : "Belum ada comparison yang cocok.",
    );
  };

  const filterCategory = (category: CategoryId) => {
    setQuery("");
    setActiveCategory(category);
    scrollToComparisons();
    notify(`Menampilkan kategori: ${category}`);
  };

  const showSaved = () => {
    notify("Saved items akan tersedia setelah login.");
  };

  const placeholder = () => {
    notify("Halaman detail sedang dalam pengembangan.");
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return comparisons.filter((c) => c.searchKeywords.includes(q));
    }
    if (activeCategory) {
      return comparisons.filter((c) => c.category === activeCategory);
    }
    return comparisons;
  }, [query, activeCategory]);

  return (
    <>
      <Navbar onSaved={showSaved} />
      <main>
        <Hero
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          onQuickCategory={filterCategory}
        />
        <ComparisonGrid items={visible} onPlaceholder={placeholder} />
        <CategoryGrid onExplore={filterCategory} />
        <LearnGrid onPlaceholder={placeholder} />
        <FeaturedComparison />
      </main>
      <Toast message={toast} />
    </>
  );
}
