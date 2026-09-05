"use client";

import Navbar from "./Navbar";
import Hero from "./Hero";
import FeatureCards from "./FeatureCards";
import StatsSection from "./StatsSection";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden min-h-screen bg-[#F8FAFC]">

      <Navbar />

      {/* 
        This unified Hero now renders both the Universe canvas 
        and the Frosted Glass card. 
      */}
      <Hero />

      <FeatureCards />
      <StatsSection />
      <Footer />

    </main>
  );
}