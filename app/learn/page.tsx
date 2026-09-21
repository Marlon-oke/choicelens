import type { Metadata } from "next";
import { learnItems } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import LearnFilter from "@/components/LearnFilter";

export const metadata: Metadata = {
  title: "Learn — ChoiceLens",
  description: "Pahami istilah, material, dan teknologi yang sering kamu temui.",
};

export default function LearnPage() {
  return (
    <main className="section">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Learn" }]}
        title="More Than Just Specs"
        desc="Pahami istilah, material, dan teknologi yang sering kamu temui."
      />
      <LearnFilter items={learnItems} />
    </main>
  );
}
