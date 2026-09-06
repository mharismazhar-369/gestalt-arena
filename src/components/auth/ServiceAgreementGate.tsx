"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ShieldAlert, Scale, CheckSquare, Square, AlertTriangle, LogOut } from "lucide-react";

export default function ServiceAgreementGate({ userId, onAgreed }: { userId: string, onAgreed: () => void }) {
    const router = useRouter();
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
    const [isDeclined, setIsDeclined] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 20;
        if (bottom) setScrolledToBottom(true);
    };

    const handleAccept = async () => {
        setIsSubmitting(true);
        // Create the "Consent Lock" in the database
        const { error } = await supabase
            .from('profiles')
            .update({
                terms_accepted_at: new Date().toISOString(),
                terms_version: '1.0'
            })
            .eq('id', userId);

        if (!error) {
            onAgreed();
        } else {
            alert("Failed to record consent. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleDecline = async () => {
        setIsDeclined(true);
        await supabase.auth.signOut();
    };

    if (isDeclined) {
        return (
            <div className="fixed inset-0 z-50 bg-[var(--primary)] flex flex-col items-center justify-center p-6 text-center">
                <div className="neu-flat-base rounded-3xl p-10 max-w-lg space-y-6">
                    <ShieldAlert size={64} className="mx-auto text-rose-500" />
                    <h1 className="text-2xl font-black text-[var(--secondary)]">Access Denied</h1>
                    <p className="text-sm font-medium text-[var(--secondary)]/70">
                        You have declined the Master Subscription Agreement. Gestalt Arena requires explicit consent to our legal, financial, and privacy frameworks to protect all participating founders and investors.
                    </p>
                    <p className="text-xs text-rose-500 font-bold">
                        Platform access and data viewing are strictly prohibited without agreement.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <button onClick={() => router.push('/')} className="flex-1 py-3 px-4 neu-pressed-base rounded-xl text-sm font-bold text-[var(--secondary)]/60 hover:text-[var(--secondary)]">
                            Return to Home
                        </button>
                        <button onClick={() => setIsDeclined(false)} className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg">
                            Review Terms
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const canSubmit = scrolledToBottom && agreedToTerms && agreedToPrivacy && !isSubmitting;

    return (
        <div className="fixed inset-0 z-50 bg-[var(--primary)]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6">
            <div className="neu-flat-base rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-blue-500/20 shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-[var(--secondary)]/10 shrink-0 bg-blue-600/5">
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-2">
                        <Scale size={16} /> Mandatory Legal Consent
                    </div>
                    <h2 className="text-2xl font-black text-[var(--secondary)]">Master Service & Arbitration Agreement</h2>
                    <p className="text-xs font-medium text-[var(--secondary)]/60 mt-1">
                        Please scroll to the bottom to acknowledge and accept our institutional terms.
                    </p>
                </div>

                {/* Scrollable Legal Text */}
                <div
                    onScroll={handleScroll}
                    className="flex-grow p-6 overflow-y-auto custom-scrollbar neu-pressed-base m-6 rounded-2xl space-y-6 text-xs text-[var(--secondary)]/80 leading-relaxed font-medium"
                >
                    <p className="font-bold text-sm text-[var(--secondary)]">Gestalt Technologies (Private) Limited ("GTPL") Master Agreement</p>

                    <div className="space-y-2">
                        <h3 className="font-bold text-rose-500 flex items-center gap-2"><AlertTriangle size={14} /> 1. "As-Is" Software & Assumption of Technical Risk</h3>
                        <p>Gestalt Arena is provided on an "AS-IS" and "AS-AVAILABLE" basis. GTPL expressly disclaims all warranties of any kind, whether express or implied, including fitness for a particular purpose, merchantability, and non-infringement. GTPL assumes no liability for data loss, un-intended data exposure, system vulnerabilities, unauthorized access, bugs, or platform downtime. You acknowledge that utilizing digital SaaS platforms carries inherent technical risks, and you utilize Gestalt Arena entirely at your own risk.</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-[var(--secondary)]">2. Relationship of Parties & Non-Broker Dealer Status</h3>
                        <p>GTPL provides a passive technology conduit for independent startups and investors. GTPL is not a registered broker-dealer, investment advisor, or crowdfunding portal under SEC, FCA, or SECP regulations. We do not endorse, verify, or guarantee the legitimacy, financial standing, or legal compliance of any user, pitch deck, or term sheet hosted on this platform.</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-[var(--secondary)]">3. Total Limitation of Liability</h3>
                        <p>To the maximum extent permitted by applicable law, in no event shall GTPL, its executives, developers, or affiliates be liable for any direct, indirect, punitive, incidental, special, or consequential damages (including loss of capital, profits, or data) arising out of or in any way connected with the use of Gestalt Arena, any delay or inability to use the platform, or any investment losses incurred through matchmaking facilitated by this platform.</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-[var(--secondary)]">4. Mandatory Arbitration & Class Action Waiver</h3>
                        <p>Any dispute, claim, or controversy arising out of or relating to this Agreement or the breach, termination, enforcement, interpretation, or validity thereof, shall be determined by binding arbitration rather than in court. You agree that you may bring claims against GTPL only in your individual capacity and not as a plaintiff or class member in any purported class or representative proceeding.</p>
                    </div>
                </div>

                {/* Consent Checkboxes & Actions */}
                <div className="p-6 border-t border-[var(--secondary)]/10 shrink-0 bg-[var(--primary)] space-y-4">

                    <div className="space-y-3">
                        <button onClick={() => setAgreedToTerms(!agreedToTerms)} className="flex items-start gap-3 text-left w-full group">
                            <div className="mt-0.5 text-blue-500 group-hover:text-blue-400 transition-colors">
                                {agreedToTerms ? <CheckSquare size={18} /> : <Square size={18} />}
                            </div>
                            <span className="text-xs font-bold text-[var(--secondary)]/70 group-hover:text-[var(--secondary)] transition-colors">
                                I have read, understood, and agree to be bound by the GTPL Master Service Agreement, including the Limitation of Liability and Mandatory Arbitration clauses.
                            </span>
                        </button>

                        <button onClick={() => setAgreedToPrivacy(!agreedToPrivacy)} className="flex items-start gap-3 text-left w-full group">
                            <div className="mt-0.5 text-blue-500 group-hover:text-blue-400 transition-colors">
                                {agreedToPrivacy ? <CheckSquare size={18} /> : <Square size={18} />}
                            </div>
                            <span className="text-xs font-bold text-[var(--secondary)]/70 group-hover:text-[var(--secondary)] transition-colors">
                                I consent to the collection, processing, and encryption of my data in accordance with the Global Privacy Policy (GDPR/CCPA compliant).
                            </span>
                        </button>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button onClick={handleDecline} disabled={isSubmitting} className="flex-1 py-3.5 px-4 bg-transparent text-rose-500 border border-rose-500/30 hover:bg-rose-500/10 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50">
                            <LogOut size={16} /> I Decline & Exit
                        </button>
                        <button onClick={handleAccept} disabled={!canSubmit} className="flex-[2] py-3.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded-xl text-sm font-bold transition shadow-lg flex items-center justify-center gap-2">
                            {isSubmitting ? "Locking Consent..." : "I Accept & Enter Platform"}
                        </button>
                    </div>

                    {!scrolledToBottom && (
                        <p className="text-center text-[10px] text-amber-500 font-bold uppercase tracking-wider animate-pulse">
                            Please scroll through the entire agreement to unlock acceptance.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}