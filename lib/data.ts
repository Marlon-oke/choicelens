export type CategoryId = "smartphones" | "laptops" | "shoes";

export interface CompareProduct {
  name: string;
  brand: string;
  img: string;
  score: number;
}

export interface Comparison {
  slug: string;
  category: CategoryId;
  searchKeywords: string;
  products: [CompareProduct, CompareProduct];
}

export const comparisons: Comparison[] = [
  {
    slug: "iphone-16-pro-vs-galaxy-s25-ultra",
    category: "smartphones",
    searchKeywords: "iphone 16 pro galaxy s25 ultra apple samsung",
    products: [
      {
        name: "iPhone 16 Pro",
        brand: "Apple",
        img: "/apple-iphone-16-pro-grey.jpg",
        score: 92,
      },
      {
        name: "Galaxy S25 Ultra",
        brand: "Samsung",
        img: "/samsung-galaxy-s25-ultra-grey.jpg",
        score: 89,
      },
    ],
  },
  {
    slug: "macbook-air-m3-vs-thinkpad-t14s",
    category: "laptops",
    searchKeywords: "macbook air m3 thinkpad t14s apple lenovo",
    products: [
      {
        name: "MacBook Air M3",
        brand: "Apple",
        img: "/apple-macbook-air-m3.jpeg",
        score: 90,
      },
      {
        name: "ThinkPad T14s",
        brand: "Lenovo",
        img: "/thinkpad-t14s.avif",
        score: 82,
      },
    ],
  },
  {
    slug: "lebron-22-vs-harden-vol-8",
    category: "shoes",
    searchKeywords: "nike lebron 22 adidas harden vol 8 basketball shoes",
    products: [
      {
        name: "Nike LeBron 22",
        brand: "Nike",
        img: "/lebron-22.jpg",
        score: 88,
      },
      {
        name: "Adidas Harden Vol. 8",
        brand: "Adidas",
        img: "/harden-vol-8.png",
        score: 84,
      },
    ],
  },
  {
    slug: "iphone-15-vs-pixel-8",
    category: "smartphones",
    searchKeywords: "iphone 15 pixel 8 apple google",
    products: [
      {
        name: "iPhone 15",
        brand: "Apple",
        img: "/apple-iphone-15-blue.jpeg",
        score: 86,
      },
      {
        name: "Pixel 8",
        brand: "Google",
        img: "/google-pixel-8.jpg",
        score: 80,
      },
    ],
  },
];

export interface LearnItem {
  title: string;
  desc: string;
  icon: string;
  artClass: string;
  img?: string;
}

export const learnItems: LearnItem[] = [
  {
    title: "AMOLED",
    desc: "Layar lebih hidup, kontras lebih tinggi, dan lebih hemat daya.",
    icon: "▣",
    artClass: "gradient-screen",
  },
  {
    title: "LTPO",
    desc: "Refresh rate adaptif untuk performa dan daya tahan baterai yang lebih baik.",
    icon: "▤",
    artClass: "layers",
  },
  {
    title: "PEBA",
    desc: "Bahan midsole premium yang lebih ringan, empuk, dan responsif.",
    icon: "◌",
    artClass: "foam",
  },
  {
    title: "Carbon Fiber",
    desc: "Material kuat, ringan, dan fleksibel untuk performa maksimal.",
    icon: "✥",
    artClass: "carbon",
    img: "/carbon-fiber.avif",
  },
];

export interface FeaturedMetric {
  label: string;
  icon: string;
  a: number;
  b: number;
}

export const featuredMetrics: FeaturedMetric[] = [
  { label: "Performa", icon: "⚙", a: 94, b: 90 },
  { label: "Kamera", icon: "▣", a: 96, b: 88 },
  { label: "Baterai", icon: "◴", a: 90, b: 87 },
];
