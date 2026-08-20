"use client";

import Universe from "./Universe";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeatureCards from "./FeatureCards";
import StatsSection from "./StatsSection";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-[#020617]">

      <Universe />

      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#02061730] to-[#020617]" />

      <Navbar />

      <HeroSection />

      <FeatureCards />

      <StatsSection />

      <Footer />

    </main>
  );
}