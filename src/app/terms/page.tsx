"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Scale, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
        <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 md:p-12 space-y-8 shadow-2xl">
          
          {/* Header */}
          <div className="border-b border-white/10 pb-8 space-y-3">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-widest">
              <Scale size={16} /> User Agreement
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white">Terms & Conditions</h1>
            <p className="text-slate-400 text-sm">Effective Date: August 20, 2026 | Gestalt Arena Platform</p>
          </div>

          {/* Terms Content */}
          <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={18} className="text-cyan-400" /> 1. Acceptance & Tier Access
              </h2>
              <p>
                By accessing Gestalt ARENA, you agree to comply with our platform guidelines. Platform capabilities (post creation limits, character thresholds, article publishing quotas, and transaction caps) are defined strictly by user membership tiers (Freemium, Gold Tier, and Platinum Tier).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" /> 2. Content Quotas & Limits
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Freemium Tier:</strong> Limited to 20 posts per 24 hours and max 500 characters per post. Article publishing is locked.</li>
                <li><strong>Gold Tier:</strong> Limited to 50 posts per 24 hours, max 1000 characters per post, up to 5 articles published daily, and maximum $50k transaction capability.</li>
                <li><strong>Platinum Tier:</strong> Maximum capabilities, extended post characters, and unlimited research publishing.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-pink-400" /> 3. Prohibited Conduct
              </h2>
              <p>
                Users are strictly forbidden from publishing fraudulent pitch data, misrepresenting liquid capital reserves, spamming directory listings, or scraping platform profiles without express written permission. Violation leads to immediate tier revocation.
              </p>
            </section>

            <section className="space-y-3 border-t border-white/10 pt-6">
              <h2 className="text-xl font-bold text-white">4. Modifications to Terms</h2>
              <p>
                Gestalt Technologies reserves the right to update these terms to align with legal regulations or platform upgrades during the Beta-Testing phase. Continued usage constitutes agreement to updated policies.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
