"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Scale, CheckCircle2, AlertTriangle, ShieldAlert, Gavel, FileText, Wallet, Store, Crown } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
        <div className="neu-flat-base rounded-3xl p-8 md:p-12 space-y-8">

          <div className="border-b border-[var(--secondary)]/10 pb-8 space-y-3 shrink-0">
            <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-xs uppercase tracking-widest">
              <Scale size={16} /> User Agreement
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)]">Terms & Conditions</h1>
            <p className="text-[var(--secondary)]/60 text-sm font-medium">Master Subscription Agreement | Gestalt Technologies (Pvt) Ltd</p>
          </div>

          <div className="space-y-8 text-sm font-medium leading-relaxed text-[var(--secondary)]/80">

            <div className="neu-pressed-base rounded-2xl border-l-4 border-l-[var(--accent)] p-6 flex flex-col md:flex-row items-start gap-4">
              <Gavel size={28} className="shrink-0 text-[var(--accent)] mt-1" />
              <div>
                <h3 className="font-bold text-base text-[var(--secondary)]">Binding Corporate Agreement</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--secondary)]/70">
                  This Master Subscription Agreement constitutes a legally binding contract between you (either an individual or the corporate entity you represent) and Gestalt Technologies (Private) Limited ("GTPL"). By accessing the Gestalt Arena platform, you agree to comply with our matchmaking guidelines and accept these terms. GTPL provides a digital marketplace connecting founders and investors; we are a technology facilitator and not a registered financial broker-dealer.
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Crown size={18} className="text-amber-500" /> 1. Tier Access & Usage Quotas
              </h2>
              <p>
                Platform capabilities, including social feed limits, research publishing, active deck allowances, and financial thresholds, are defined strictly by your active membership tier. Circumvention of these limits is a material breach of this agreement.
              </p>
              <ul className="list-none space-y-2 text-xs text-[var(--secondary)]/70 mt-2">
                <li className="neu-pressed-base p-4 rounded-xl border border-transparent flex flex-col gap-1">
                  <strong className="text-[var(--secondary)]">Freemium (Discovery Pass):</strong>
                  <span>Limited to 3 posts per 24 hours (max 500 characters), 1 research article per month, and 1 draft-only pitch deck. Direct deal interactions and capital deployments are restricted to $0 (Browse Only).</span>
                </li>
                <li className="neu-pressed-base p-4 rounded-xl border border-amber-500/30 flex flex-col gap-1">
                  <strong className="text-amber-500">Gold Tier:</strong>
                  <span>Allows up to 10 posts per 24 hours (max 1,000 characters), 4 research articles per month, and up to 3 active public decks. Financial transactions and raise caps are permitted up to $500,000.</span>
                </li>
                <li className="neu-pressed-base p-4 rounded-xl border border-purple-500/30 flex flex-col gap-1">
                  <strong className="text-purple-500">Platinum Tier:</strong>
                  <span>Allows up to 15 posts per 24 hours (max 1,500 characters), 10 research articles per month, and unlimited active decks. Financial transactions and ticket caps are unlimited (or up to $5,000,000+ for startups).</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" /> 2. Platform Roles & Matchmaking
              </h2>
              <p>
                Users are responsible for the accuracy of their financial metrics, capital allocations, and funding goals. Startups may publish Pitch Decks, while Capital Partners may publish Capital Mandates and Bid Decks. By initiating deal negotiations, investors verify they possess the liquid capital matching their stated target ticket size.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Wallet size={18} className="text-blue-500" /> 3. Deal Execution & Platform Fees
              </h2>
              <p>
                Gestalt Arena provides a Deal Room and Negotiation Ledger for users to structure agreements securely. By utilizing the platform to successfully secure capital or deploy funds, users agree to a standardized platform success fee.
              </p>
              <div className="neu-pressed-base p-4 rounded-xl border border-blue-500/30 text-xs mt-2">
                <strong className="text-blue-500 block mb-1">Standard Facilitator Fee (2%):</strong>
                A mandatory 2% platform revenue fee is applied to the final locked ticket size of all deals mathematically finalized and closed via the Gestalt Arena Deal Ledger. Both parties are jointly responsible for ensuring the accurate recording of transferred funds.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Store size={18} className="text-[var(--accent)]" /> 4. Sponsored Emporium & Campaigns
              </h2>
              <p>
                Users may publish advertisements, products, and service campaigns to the Emporium Marketplace. Gold Tier members receive a 10% discount on ad rates, and Platinum members receive 1 free standard ad per month. GTPL reserves the right to unpublish campaigns that fail to meet targeting criteria or display inappropriate content.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <FileText size={18} className="text-indigo-500" /> 5. Content Ownership & Telemetry
              </h2>
              <p>
                You retain full intellectual property rights to your pitch decks, financial data, and proprietary documents. However, you grant GTPL a license to host and process this data for matchmaking purposes. Furthermore, you consent to our automated backend telemetry logging, which tracks UI interactions, site visits, and hashtag trends strictly to improve platform security and user experience.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-500" /> 6. Prohibited Conduct & Termination
              </h2>
              <p>
                Users are strictly forbidden from publishing fraudulent pitch data, misrepresenting liquid capital reserves, scraping platform profiles, or utilizing the platform to launder money. GTPL reserves the unilateral right to suspend, terminate, or pursue civil litigation against any account found violating these constraints, leading to immediate account and tier revocation without prior notice or refund.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[var(--secondary)]/10">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> 7. Indemnification & Modifications
              </h2>
              <p>
                You agree to indemnify and hold harmless GTPL and its executives from any claims, losses, or damages arising from your platform interactions, financial negotiations, or failed investments. Gestalt Technologies reserves the right to update these terms to align with legal regulations or platform upgrades; continued usage constitutes agreement to updated policies.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}