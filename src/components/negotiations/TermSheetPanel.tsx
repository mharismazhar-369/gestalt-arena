"use client";

import { useState, useEffect } from "react";
import { DollarSign, Activity, PieChart, RefreshCw, XCircle, CheckCircle2, Lock, Landmark, FileText, Building, Hash, CreditCard } from "lucide-react";

interface TermSheetPanelProps {
    deal: any;
    dealId: string;
    userId?: string;
    timeLeft: string;
    isFullyLocked: boolean;
    onUpdateStatus: (status: string, isCounter: boolean, newTerms?: any) => void;
    onConfirmFunds: (proof: { bank: string, mode: string, reference: string }) => void;
}

export default function TermSheetPanel({
    deal, dealId, userId, timeLeft, isFullyLocked, onUpdateStatus, onConfirmFunds
}: TermSheetPanelProps) {
    const isFounder = userId === deal.startup_id;
    const termsLocked = deal.status === "Pending Finalization" || deal.status === "Accepted" || deal.status === "Rejected" || deal.status === "Cancelled" || isFullyLocked;

    const [terms, setTerms] = useState({
        valuation: deal.proposed_valuation || 0,
        equity: deal.proposed_equity || 0,
        ticket_size: deal.ticket_size || 0,
        additional_terms: deal.additional_terms || "",
    });

    const [updating, setUpdating] = useState(false);
    const [showProofForm, setShowProofForm] = useState(false);
    const [transferProof, setTransferProof] = useState({ bank: "", mode: "Wire Transfer", reference: "" });

    useEffect(() => {
        setTerms({
            valuation: deal.proposed_valuation || 0,
            equity: deal.proposed_equity || 0,
            ticket_size: deal.ticket_size || 0,
            additional_terms: deal.additional_terms || "",
        });
    }, [deal.proposed_valuation, deal.proposed_equity, deal.ticket_size, deal.additional_terms]);

    const isDirty = (
        terms.valuation !== (deal.proposed_valuation || 0) ||
        terms.equity !== (deal.proposed_equity || 0) ||
        terms.ticket_size !== (deal.ticket_size || 0) ||
        terms.additional_terms !== (deal.additional_terms || "")
    );

    const handleCounter = async () => {
        setUpdating(true);
        await onUpdateStatus("Negotiating", true, terms);
        setUpdating(false);
    };

    const handleAccept = async () => {
        if (isDirty) return;
        setUpdating(true);
        await onUpdateStatus("Pending Finalization", true, terms);
        setUpdating(false);
    };

    const submitProof = () => {
        if (!transferProof.bank || !transferProof.reference) return;
        setUpdating(true);
        onConfirmFunds(transferProof);
    };

    const platformFee = terms.ticket_size * 0.01;

    return (
        <div className="neu-flat-base p-8 relative overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4 mb-6">
                <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                    <Activity size={18} className={isFounder ? "text-violet-600" : "text-[var(--accent)]"} /> Live Term Sheet
                </h2>
                {termsLocked ? <Lock size={14} className="text-rose-600" /> : <RefreshCw size={14} className="text-emerald-600" />}
            </div>

            <div className="space-y-6 flex-grow">
                {/* Inputs ... */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1.5"><DollarSign size={12} className="text-emerald-600" /> Investment Amount</label>
                    <input type="number" value={terms.ticket_size} onChange={(e) => setTerms({ ...terms, ticket_size: Number(e.target.value) })} disabled={termsLocked} className="w-full bg-transparent border-transparent neu-pressed-base shadow-inner rounded-xl p-4 text-lg font-mono font-bold text-[var(--secondary)] focus:ring-1 focus:ring-emerald-500 focus:outline-none transition disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1.5"><Activity size={12} className="text-[var(--accent)]" /> Pre-Money Valuation</label>
                    <input type="number" value={terms.valuation} onChange={(e) => setTerms({ ...terms, valuation: Number(e.target.value) })} disabled={termsLocked} className="w-full bg-transparent border-transparent neu-pressed-base shadow-inner rounded-xl p-4 text-lg font-mono font-bold text-[var(--secondary)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none transition disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1.5"><PieChart size={12} className="text-[var(--accent)]" /> Equity Stake (%)</label>
                    <input type="number" value={terms.equity} onChange={(e) => setTerms({ ...terms, equity: Number(e.target.value) })} disabled={termsLocked} className="w-full bg-transparent border-transparent neu-pressed-base shadow-inner rounded-xl p-4 text-lg font-mono font-bold text-[var(--secondary)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none transition disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1.5"><FileText size={12} className="text-violet-600" /> Additional Terms & Conditions</label>
                    <textarea rows={3} value={terms.additional_terms} onChange={(e) => setTerms({ ...terms, additional_terms: e.target.value })} disabled={termsLocked} placeholder="e.g., Board seat required..." className="w-full bg-transparent border-transparent neu-pressed-base shadow-inner rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:ring-1 focus:ring-violet-500 focus:outline-none transition disabled:opacity-50 resize-none" />
                </div>

                <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between text-blue-600">
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><Landmark size={12} /> Platform Success Fee (1%)</span>
                        <span className="font-mono font-bold">${platformFee.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] font-medium text-[var(--secondary)]/60 pt-1">To be charged equally from both parties upon successful finalization of the deal.</p>
                </div>
            </div>

            {!termsLocked && (
                <div className="mt-8 space-y-4 pt-6 border-t border-[var(--secondary)]/10">
                    <button onClick={handleCounter} disabled={updating || !isDirty} className="w-full flex items-center justify-center gap-2 neu-btn px-4 py-3 text-xs disabled:opacity-50">
                        <RefreshCw size={14} className={updating ? "animate-spin" : ""} /> Submit Counter Offer
                    </button>
                    {isDirty && <p className="text-[10px] text-amber-600 font-bold text-center px-2">Terms modified. You must submit your counter offer before accepting.</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => onUpdateStatus("Rejected", false)} disabled={updating} className="flex items-center justify-center gap-2 bg-transparent text-rose-600 border border-rose-600/30 hover:bg-rose-600/10 rounded-xl px-4 py-3 text-xs font-bold transition">
                            <XCircle size={14} /> Reject
                        </button>
                        <button onClick={handleAccept} disabled={updating || isDirty} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 text-xs font-bold transition disabled:opacity-50">
                            <CheckCircle2 size={14} /> Accept Terms
                        </button>
                    </div>
                </div>
            )}

            {deal.status === "Pending Finalization" && !isFullyLocked && (
                <div className="mt-8 space-y-4 pt-6 border-t border-amber-600/20 bg-amber-600/5 p-5 rounded-xl">
                    <div className="text-center space-y-1 mb-4">
                        <h4 className="text-sm font-bold text-amber-600 flex items-center justify-center gap-2">24-Hour Grace Period</h4>
                        <p className="text-[10px] text-[var(--secondary)]/70 font-medium uppercase tracking-wider">Time remaining: <span className="font-mono font-bold text-[var(--secondary)]">{timeLeft}</span></p>
                    </div>

                    {!isFounder && !showProofForm && (
                        <button onClick={() => setShowProofForm(true)} className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 text-xs font-bold transition shadow-lg">
                            <CheckCircle2 size={14} /> I Have Issued the Funds
                        </button>
                    )}

                    {/* NEW: Evidence Form */}
                    {!isFounder && showProofForm && (
                        <div className="bg-[var(--primary)] p-4 rounded-xl border border-blue-600/30 space-y-4">
                            <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Proof of Transfer Required</h5>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[9px] font-bold text-[var(--secondary)]/60 uppercase flex items-center gap-1 mb-1"><Building size={10} /> Issuing Bank Name</label>
                                    <input type="text" value={transferProof.bank} onChange={e => setTransferProof({ ...transferProof, bank: e.target.value })} placeholder="e.g. Chase, SVB" className="w-full bg-transparent border border-[var(--secondary)]/10 rounded-lg p-2.5 text-xs font-medium text-[var(--secondary)] outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-[var(--secondary)]/60 uppercase flex items-center gap-1 mb-1"><CreditCard size={10} /> Transfer Mode</label>
                                    <select value={transferProof.mode} onChange={e => setTransferProof({ ...transferProof, mode: e.target.value })} className="w-full bg-transparent border border-[var(--secondary)]/10 rounded-lg p-2.5 text-xs font-medium text-[var(--secondary)] outline-none focus:border-blue-500">
                                        <option value="Wire Transfer">Wire Transfer</option>
                                        <option value="ACH">ACH</option>
                                        <option value="Crypto (USDC/USDT)">Crypto (USDC/USDT)</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-[var(--secondary)]/60 uppercase flex items-center gap-1 mb-1"><Hash size={10} /> Transaction Reference / TXID</label>
                                    <input type="text" value={transferProof.reference} onChange={e => setTransferProof({ ...transferProof, reference: e.target.value })} placeholder="Ref # or TXID" className="w-full bg-transparent border border-[var(--secondary)]/10 rounded-lg p-2.5 text-xs font-medium text-[var(--secondary)] outline-none focus:border-blue-500" />
                                </div>
                                <button onClick={submitProof} disabled={!transferProof.bank || !transferProof.reference || updating} className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-[10px] font-bold transition disabled:opacity-50">
                                    {updating ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Lock Deal & Submit Proof
                                </button>
                            </div>
                        </div>
                    )}

                    {!showProofForm && (
                        <button onClick={() => onUpdateStatus("Cancelled", false)} disabled={updating} className="w-full flex items-center justify-center gap-2 bg-transparent text-rose-600 border border-rose-600/30 hover:bg-rose-600/10 rounded-xl px-4 py-3 text-xs font-bold transition disabled:opacity-50">
                            <XCircle size={14} /> Cancel Deal
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}