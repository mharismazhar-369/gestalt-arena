"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
        <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 md:p-12 space-y-8 shadow-2xl">
          
          {/* Header */}
          <div className="border-b border-white/10 pb-8 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck size={16} /> Legal Document
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white">Privacy Policy</h1>
            <p className="text-slate-400 text-sm">Last updated: August 20, 2026 | Gestalt Technologies (Pvt) Ltd</p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock size={18} className="text-cyan-400" /> 1. Information Collection
              </h2>
              <p>
                Gestalt ARENA collects minimal user data necessary to operate our window-shopping marketplace platform. This includes email addresses provided during registration, public profile metadata created by founders or investors, and operational telemetry.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye size={18} className="text-violet-400" /> 2. Public vs Private Data
              </h2>
              <p>
                Public profiles in our startup and investor directories are intentionally visible for window-shopping discovery. Private pitch decks, investment transaction details, and confidential financial terms remain encrypted and are accessible strictly by authorized counterparties.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-pink-400" /> 3. Cookies & Local Storage
              </h2>
              <p>
                We utilize essential session tokens and preference cookies stored in your web browser to preserve user authentication state, tier settings, and navigation preferences. No cross-site tracking cookies are sold to third-party data brokers.
              </p>
            </section>

            <section className="space-y-3 border-t border-white/10 pt-6">
              <h2 className="text-xl font-bold text-white">4. Data Rights & Contact</h2>
              <p>
                Users maintain complete ownership over their published profile metadata. You may request account deletion or data export at any time by contacting our privacy officer at <span className="text-cyan-400 font-mono">privacy@gestaltarena.com</span>.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
