"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Scale, CheckCircle2, AlertTriangle, ShieldAlert, Gavel, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
        <div className="neu-flat-base rounded-3xl p-8 md:p-12 space-y-8">

          <div className="border-b border-[var(--secondary)]/10 pb-8 space-y-3 shrink-0">
            <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-widest">
              <Scale size={16} /> User Agreement
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)]">Terms & Conditions</h1>
            <p className="text-[var(--secondary)]/60 text-sm font-medium">Master Subscription Agreement | Gestalt Technologies (Pvt) Ltd</p>
          </div>

          <div className="space-y-8 text-sm font-medium leading-relaxed text-[var(--secondary)]/80">

            <div className="neu-pressed-base rounded-2xl border-l-4 border-l-violet-500 p-6 flex flex-col md:flex-row items-start gap-4">
              <Gavel size={28} className="shrink-0 text-violet-500 mt-1" />
              <div>
                <h3 className="font-bold text-base text-[var(--secondary)]">Binding Corporate Agreement</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--secondary)]/70">
                  This Master Subscription Agreement constitutes a legally binding contract between you (either an individual or the corporate entity you represent) and Gestalt Technologies (Private) Limited ("GTPL"). By accessing the Gestalt Arena SaaS platform, you unequivocally agree to comply with our platform guidelines and accept these terms. GTPL provides a digital marketplace connecting founders and investors; we are not a registered financial broker-dealer.
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-500" /> 1. Tier Access & Usage Quotas
              </h2>
              <p>
                Platform capabilities, including post creation limits, character thresholds, article publishing quotas, and transaction caps, are defined strictly by user membership tiers. Circumvention of these limits is a material breach of this agreement.
              </p>
              <ul className="list-none space-y-2 text-xs text-[var(--secondary)]/70 mt-2">
                <li className="neu-pressed-base p-3 rounded-xl border border-transparent flex flex-col gap-1">
                  <strong className="text-[var(--secondary)]">Freemium Tier:</strong>
                  <span>Limited to 20 posts per 24 hours and a maximum of 500 characters per post. Article publishing is locked, and investment capabilities are strictly read-only.</span>
                </li>
                <li className="neu-pressed-base p-3 rounded-xl border border-amber-500/30 flex flex-col gap-1">
                  <strong className="text-amber-500">Gold Tier:</strong>
                  <span>Limited to 50 posts per 24 hours and a maximum of 1,000 characters per post. Includes rights to publish up to 5 research articles per day and transact up to a $50,000 threshold.</span>
                </li>
                <li className="neu-pressed-base p-3 rounded-xl border border-emerald-500/30 flex flex-col gap-1">
                  <strong className="text-emerald-500">Platinum Tier:</strong>
                  <span>Grants unrestricted platform capabilities, including unlimited posts up to 5,000 characters, unlimited daily article publishing, and unlimited investment allocation thresholds.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <FileText size={18} className="text-[var(--accent)]" /> 2. Content Ownership & Platform License
              </h2>
              <p>
                You retain full intellectual property rights to your pitch decks, financial data, and proprietary documents. However, by uploading content to Gestalt Arena, you grant GTPL a worldwide, non-exclusive, royalty-free license to host, encrypt, and display this data strictly within the parameters of the platform's matchmaking architecture.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-500" /> 3. Prohibited Conduct & Termination
              </h2>
              <p>
                Users are strictly forbidden from publishing fraudulent pitch data, misrepresenting liquid capital reserves, spamming directory listings, or scraping platform profiles without express written permission. GTPL reserves the unilateral right to suspend, terminate, or pursue civil litigation against any account found violating these constraints, leading to immediate tier revocation without prior notice or refund.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[var(--secondary)]/10">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> 4. Indemnification & Modifications
              </h2>
              <p>
                You agree to indemnify and hold harmless GTPL and its executives from any claims, losses, or damages arising from your platform interactions or failed investments. Gestalt Technologies reserves the right to update these terms to align with legal regulations or platform upgrades; continued usage constitutes agreement to updated policies.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}