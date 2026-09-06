"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ShieldCheck, Lock, Eye, FileText, Globe, Database, Scale } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
        <div className="neu-flat-base rounded-3xl p-8 md:p-12 space-y-8">

          <div className="border-b border-[var(--secondary)]/10 pb-8 space-y-3 shrink-0">
            <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck size={16} /> Data Protection & Privacy Framework
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)]">Privacy Policy</h1>
            <p className="text-[var(--secondary)]/60 text-sm font-medium">Global GDPR & CCPA Compliance Notice | Gestalt Technologies (Pvt) Ltd</p>
          </div>

          <div className="space-y-8 text-sm font-medium leading-relaxed text-[var(--secondary)]/80">

            <div className="neu-pressed-base rounded-2xl border-l-4 border-l-blue-500 p-6 flex flex-col md:flex-row items-start gap-4">
              <ShieldCheck size={28} className="shrink-0 text-blue-500 mt-1" />
              <div>
                <h3 className="font-bold text-base text-[var(--secondary)]">Commitment to Global Data Privacy</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--secondary)]/70">
                  Gestalt Technologies (Private) Limited ("GTPL", "we", "us") enforces a strict, institutional-grade data privacy framework. This policy dictates how Gestalt Arena collects, processes, and encrypts your personal, corporate, and financial data in stringent accordance with the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and applicable international data protection mandates.
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Database size={18} className="text-emerald-500" /> 1. Information Collection & Processing
              </h2>
              <p>
                We collect specifically categorized data streams to facilitate secure digital matchmaking: <strong>Identity Data</strong> (names, corporate affiliations, KYC/AML verification flags), <strong>Financial Metadata</strong> (anonymized ticket sizes, valuation parameters, funding goals), and <strong>Telemetry Data</strong> (IP addresses, browser signatures, session cookies). We operate on the principle of data minimization; only data strictly necessary for fulfilling contractual obligations and ensuring platform integrity is processed.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Eye size={18} className="text-violet-500" /> 2. Public Directory vs. Encrypted Deal Rooms
              </h2>
              <p>
                Gestalt Arena bifurcates data visibility. Baseline profiles (company name, industry, investment thesis) are indexed globally for discoverability. Conversely, proprietary documents—including pitch decks, term sheets, direct messages, and capital transfer proofs—are strictly localized to authenticated, participant-restricted Deal Rooms. GTPL does not mine or expose Deal Room contents to unauthorized third parties or global search engines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Globe size={18} className="text-[var(--accent)]" /> 3. International Rights (GDPR & CCPA)
              </h2>
              <p>
                Regardless of your geographic jurisdiction, GTPL guarantees your statutory rights. <strong>EU/UK Residents (GDPR):</strong> You retain the absolute right to data access, rectification, portability, and erasure (the "Right to be Forgotten"). <strong>California Residents (CCPA/CPRA):</strong> We unequivocally state that GTPL <em>does not</em> and <em>will not</em> sell your personal data or corporate metadata to third-party data brokers. You have the right to request a comprehensive disclosure of data processing categories.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Lock size={18} className="text-rose-500" /> 4. Security Architecture & Retention
              </h2>
              <p>
                All data in transit is secured via TLS 1.3, and data at rest is protected utilizing AES-256 encryption. While GTPL deploys commercial best practices to protect your data, no digital architecture is completely invulnerable. Data is retained only for the lifecycle of your active account, plus any mandatory legal archiving periods required for financial compliance and anti-fraud auditing.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[var(--secondary)]/10">
              <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                <Scale size={18} className="text-cyan-500" /> 5. Legal Inquiries & Data Subject Requests
              </h2>
              <p>
                To exercise your regulatory rights, execute a data export, or initiate an account deletion mandate, please submit a formal Data Subject Access Request (DSAR) to our Data Protection Officer (DPO) via encrypted channel at <span className="text-blue-500 font-mono font-bold">gestalttech.pltd@gmail.com</span>.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}