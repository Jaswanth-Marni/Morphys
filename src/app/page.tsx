import { ProgressiveBlur, DotPattern, Hero, StyleShowcase, Footer } from "@/components/ui";
import { HomeVisitTracker } from "@/components/ui/HomeVisitTracker";

export default function Home() {
  return (
    <main className="relative">
      <HomeVisitTracker />
      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative min-h-screen">
        {/* Animated dot pattern background */}
        <DotPattern />

        {/* Hero Section */}
        <Hero />

        {/* Progressive blur overlays */}
        {/* Top Blur - Mobile (Stronger) */}
        <ProgressiveBlur className="block md:hidden" position="top" height="150px" blurLevels={[1, 2, 4, 8, 16, 32, 64, 128]} />
        {/* Top Blur - Desktop (Standard) */}
        <ProgressiveBlur className="hidden md:block" position="top" height="150px" />
        <ProgressiveBlur position="bottom" height="150px" />
      </section>

      {/* ===== SECTION 2: STYLE SHOWCASE ===== */}
      <StyleShowcase />

      {/* ===== FOOTER ===== */}
      <Footer />
    </main>
  );
}
