"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { AlertCircle, ShieldAlert, Coins, HelpCircle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
        <div className="trionn-glass-card rounded-3xl border border-amber-500/20 p-8 md:p-12 space-y-8 shadow-2xl">
          
          {/* Header */}
          <div className="border-b border-white/10 pb-8 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
              <AlertCircle size={16} /> Regulatory Disclosure
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white">Investment Disclaimer</h1>
            <p className="text-slate-400 text-sm">Non-Broker-Dealer Disclosure & Financial Notice</p>
          </div>

          {/* Disclaimer Content */}
          <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
            
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-6 flex items-start gap-4 text-amber-200">
              <ShieldAlert size={28} className="shrink-0 text-amber-400 mt-1" />
              <div>
                <h3 className="font-bold text-base text-white">Not a Registered Broker-Dealer or Financial Advisor</h3>
                <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
                  Gestalt ARENA is an information and matchmaking technology platform. Gestalt Technologies (Pvt) Ltd does not act as a registered broker-dealer, investment advisor, crowdfunding portal, or underwriter.
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Coins size={18} className="text-cyan-400" /> 1. No Investment Advice or Solicitation
              </h2>
              <p>
                The information, research articles, startup listings, and investor tags displayed on Gestalt ARENA are for informational and networking purposes only. Nothing on this website constitutes a direct offer to buy or sell securities, equity stakes, or financial instruments.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-violet-400" /> 2. Due Diligence Responsibility
              </h2>
              <p>
                Investors and startup founders are solely responsible for conducting their own independent legal, financial, tax, and technical due diligence before entering into any transaction or binding commitment. Gestalt ARENA makes no representations or warranties regarding startup valuations or investor liquidity credentials.
              </p>
            </section>

            <section className="space-y-3 border-t border-white/10 pt-6">
              <h2 className="text-xl font-bold text-white">3. High Risk of Early-Stage Investments</h2>
              <p>
                Early-stage startup investments carry a high degree of capital risk and illiquidity. Investors should be prepared to sustain the potential total loss of invested funds. Always consult qualified professional legal and financial counselors.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
