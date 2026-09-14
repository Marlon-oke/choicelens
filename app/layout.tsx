import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ChoiceLens — Pilih yang Tepat",
  description:
    "ChoiceLens — bandingkan teknologi, material, dan produk sebelum memilih.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
