"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { AlertCircle, ShieldAlert, Coins, HelpCircle, Scale, Globe, FileWarning } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
        <div className="neu-flat-base rounded-3xl p-8 md:p-12 space-y-8">

          <div className="border-b border-[var(--secondary)]/10 pb-8 space-y-3 shrink-0">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-widest">
              <AlertCircle size={16} /> Legal & Regulatory Disclosure
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)]">Platform Disclaimer</h1>
            <p className="text-[var(--secondary)]/60 text-sm font-medium">Comprehensive Limitation of Liability & Non-Broker-Dealer Notice</p>
          </div>

          <div className="space-y-8 text-sm font-medium leading-relaxed text-[var(--secondary)]/80">

            <div className="neu-pressed-base rounded-2xl border-l-4 border-l-rose-500 p-6 flex flex-col md:flex-row items-start gap-4">
              <ShieldAlert size={28} className="shrink-0 text-rose-500 mt-1" />
              <div>
                <h3 className="font-bold text-base text-[var(--secondary)]">Not a Registered Broker-Dealer or Financial Advisor</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--secondary)]/70">
                  Gestalt Arena is exclusively a technology-driven communications and matchmaking platform developed and operated by Gestalt Technologies (Private) Limited ("GTPL"). GTPL is not registered as a broker-dealer, investment advisor, funding portal, or underwriter with the U.S. Securities and Exchange Commission (SEC), the Financial Conduct Authority (FCA), the Securities and Exchange Commission of Pakistan (SECP), or any other global regulatory authority.
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <FileWarning size={18} className="text-blue-500" /> 1. No Investment Advice or Solicitation
              </h2>
              <p>
                No content, data, startup profiles, pitch decks, term sheets, or communications hosted on Gestalt Arena shall be construed as a recommendation, endorsement, or solicitation by GTPL to buy, sell, or hold any security, financial product, or instrument. All data provided through the platform is for informational purposes only. GTPL does not evaluate, verify, or endorse the viability, legality, or financial accuracy of any startup or investor participating on the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <HelpCircle size={18} className="text-violet-500" /> 2. Absolute Assumption of Risk & Due Diligence
              </h2>
              <p>
                Investing in early-stage startups, privately held companies, and digital assets involves an exceptionally high degree of risk, including the total and permanent loss of capital. Users are solely responsible for conducting their own independent technical, financial, legal, and tax due diligence. GTPL mandates that all parties consult with licensed legal counsel and certified financial advisors before executing any transaction, term sheet, or binding agreement initiated through this platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Globe size={18} className="text-emerald-500" /> 3. Jurisdictional Compliance
              </h2>
              <p>
                Gestalt Arena is accessible globally; however, the availability of fundraising opportunities does not constitute an offer in jurisdictions where such activities are illegal or require specific regulatory registration. It is the strict responsibility of the user to ensure their participation complies with the local securities laws, tax regulations, and syndication rules of their respective country or state of residence.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Coins size={18} className="text-amber-500" /> 4. Forward-Looking Statements
              </h2>
              <p>
                Pitch decks and negotiation materials hosted on the platform frequently contain forward-looking statements involving known and unknown risks, uncertainties, and assumptions. Actual results, financial performance, and startup trajectories may differ materially from those projected. GTPL assumes no liability for the failure of any startup to meet its projected targets.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[var(--secondary)]/10">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Scale size={18} className="text-[var(--accent)]" /> 5. Complete Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, Gestalt Technologies (Private) Limited, its directors, officers, employees, and affiliates shall not be held liable for any direct, indirect, incidental, consequential, or punitive damages, including but not limited to loss of profits, loss of capital, data breaches, or business interruptions arising out of your use of Gestalt Arena, reliance on platform data, or the execution of external financial transfers resulting from platform connections.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}