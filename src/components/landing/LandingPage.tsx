"use client";

import Universe from "./Universe";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeatureCards from "./FeatureCards";
import StatsSection from "./StatsSection";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <main className="theme-investor relative overflow-hidden min-h-screen">

      {/* Background Aether Engine */}
      <Universe />

      {/* UI Components */}
      <Navbar />
      <HeroSection />
      <FeatureCards />
      <StatsSection />
      <Footer />

    </main>
  );
}