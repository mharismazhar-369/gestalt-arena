"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Target, DollarSign, Briefcase, FileText, Loader2, Send, Globe, Clock, Percent, Link as LinkIcon, Plus, X } from "lucide-react";

interface BidDeckBuilderProps {
    investorId: string;
}

function BidDeckBuilderForm({ investorId }: BidDeckBuilderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetPitchId = searchParams.get("target_pitch");

    // Moved to component scope so both the UI and the submit handler can access it
    const isTargeted = !!targetPitchId;

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        thesis: "",
        target_sectors: "",
        target_countries: "",
        investment_duration: "",
        investment_type: "Equity",
        min_roi: "",
        min_arr: "",
        max_allocation: "",
    });

    const [portfolioLinks, setPortfolioLinks] = useState<string[]>([""]);

    const handlePortfolioChange = (index: number, value: string) => {
        const newLinks = [...portfolioLinks];
        newLinks[index] = value;
        setPortfolioLinks(newLinks);
    };

    const addPortfolioLink = () => {
        if (portfolioLinks.length < 3) setPortfolioLinks([...portfolioLinks, ""]);
    };

    const removePortfolioLink = (index: number) => {
        setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const sectorsArray = form.target_sectors.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        const countriesArray = form.target_countries.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        const portfoliosArray = portfolioLinks.map((l) => l.trim()).filter((l) => l.length > 0);

        const bidStatus = isTargeted ? "Private" : "active";

        const { data: newBid, error: insertError } = await supabase.from("investor_bid_decks").insert({
            investor_id: investorId,
            title: form.title,
            thesis: form.thesis,
            target_sectors: sectorsArray,
            target_countries: countriesArray,
            investment_duration: form.investment_duration,
            investment_type: form.investment_type,
            min_roi: form.min_roi ? Number(form.min_roi) : null,
            min_arr: form.min_arr ? Number(form.min_arr) : 0,
            max_allocation: form.max_allocation ? Number(form.max_allocation) : 0,
            previous_portfolios: portfoliosArray,
            status: bidStatus,
        }).select().single();

        if (insertError || !newBid) {
            setError(insertError?.message || "Database execution failed.");
            setSaving(false);
            return;
        }

        if (isTargeted && targetPitchId) {
            const { data: pitchData } = await supabase
                .from("pitch_decks")
                .select("user_id")
                .eq("id", targetPitchId)
                .single();

            if (pitchData) {
                const { data: newDeal, error: dealError } = await supabase.from("deal_negotiations").insert({
                    startup_id: pitchData.user_id,
                    investor_id: investorId,
                    pitch_deck_id: targetPitchId,
                    bid_deck_id: newBid.id,
                    status: "Pending Founder Approval",
                }).select().single();

                if (newDeal && !dealError) {
                    await supabase.from("notifications").insert({
                        user_id: pitchData.user_id,
                        actor_id: investorId,
                        type: "deal_initiated",
                        message: "submitted a private counter-offer to your pitch.",
                        reference_id: newDeal.id
                    });

                    router.push(`/negotiations/${newDeal.id}`);
                    return;
                }
            }
        }

        router.push("/investor/dashboard");
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {isTargeted && (
                <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 neu-pressed-base shadow-inner p-4 text-sm font-bold text-[var(--accent)] flex items-center gap-2">
                    <Target size={16} /> Creating targeted private counter-offer. This mandate will not be publicly visible.
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-rose-600/30 bg-transparent neu-pressed-base shadow-inner p-4 text-sm font-bold text-rose-600">
                    {error}
                </div>
            )}

            <div className="neu-flat-base p-8 space-y-6">
                <h2 className="text-xl font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-4">
                    <Target size={18} className="text-[var(--accent)]" /> Mandate Fundamentals
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider block mb-1">
                            Bid Deck Title
                        </label>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder={isTargeted ? "e.g. Counter-Offer for [Startup Name]" : "e.g. 2026 DeepTech Seed Fund Allocation"}
                            className="w-full rounded-xl border-transparent bg-transparent px-4 py-3 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/40 focus:outline-none transition neu-pressed-base shadow-inner font-medium focus:ring-1 focus:ring-[var(--accent)]"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider block mb-1 flex items-center gap-1">
                            <FileText size={12} className="text-[var(--accent)]" /> Investment Thesis & Requirements
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={form.thesis}
                            onChange={(e) => setForm({ ...form, thesis: e.target.value })}
                            placeholder="Detail your investment thesis, required traction, and founder expectations..."
                            className="w-full rounded-xl border-transparent bg-transparent p-4 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/40 focus:outline-none transition resize-none neu-pressed-base shadow-inner font-medium focus:ring-1 focus:ring-[var(--accent)]"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider block mb-1 flex items-center gap-1">
                                <Briefcase size={12} className="text-[var(--accent)]" /> Target Sectors (Comma Separated)
                            </label>
                            <input
                                type="text"
                                required
                                value={form.target_sectors}
                                onChange={(e) => setForm({ ...form, target_sectors: e.target.value })}
                                placeholder="e.g. AI, B2B SaaS, Climate Tech"
                                className="w-full rounded-xl border-transparent bg-transparent px-4 py-3 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/40 focus:outline-none transition neu-pressed-base shadow-inner font-medium focus:ring-1 focus:ring-[var(--accent)]"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider block mb-1 flex items-center gap-1">
                                <Globe size={12} className="text-[var(--accent)]" /> Target Countries (Comma Separated)
                            </label>
                            <input
                                type="text"
                                value={form.target_countries}
                                onChange={(e) => setForm({ ...form, target_countries: e.target.value })}
                                placeholder="e.g. US, UK, Germany (Leave empty for Global)"
                                className="w-full rounded-xl border-transparent bg-transparent px-4 py-3 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/40 focus:outline-none transition neu-pressed-base shadow-inner font-medium focus:ring-1 focus:ring-[var(--accent)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="neu-flat-base p-8 space-y-6">
                <h2 className="text-xl font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-4">
                    <DollarSign size={18} className="text-emerald-600" /> Capital & Return Parameters
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider block mb-1">
                            Maximum Allocation Cap ($)
                        </label>
                        <input
                            type="number"
                            required
                            min="1000"
                            value={form.max_allocation}
                            onChange={(e) => setForm({ ...form, max_allocation: e.target.value })}
                            placeholder="e.g. 500000"
                            className="w-full rounded-xl border-transparent bg-transparent px-4 py-3 text-sm font-mono font-bold text-emerald-600 placeholder-[var(--secondary)]/40 focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider block mb-1">
                            Minimum ARR Requirement ($)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={form.min_arr}
                            onChange={(e) => setForm({ ...form, min_arr: e.target.value })}
                            placeholder="e.g. 100000 (Optional)"
                            className="w-full rounded-xl border-transparent bg-transparent px-4 py-3 text-sm font-mono font-bold text-[var(--secondary)] placeholder-[var(--secondary)]/40 focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider block mb-1">
                            Investment Type
                        </label>
                        <select
                            value={form.investment_type}
                            onChange={(e) => setForm({ ...form, investment_type: e.target.value })}
                            className="w-full rounded-xl border-transparent bg-transparent px-4 py-3 text-sm font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]"
                        >
                            <option className="bg-[var(--primary)] text-[var(--secondary)]" value="Equity">Equity</option>
                            <option className="bg-[var(--primary)] text-[var(--secondary)]" value="Convertible Note">Convertible Note</option>
                            <option className="bg-[var(--primary)] text-[var(--secondary)]" value="SAFE">SAFE</option>
                            <option className="bg-[var(--primary)] text-[var(--secondary)]" value="Debt">Debt</option>
                            <option className="bg-[var(--primary)] text-[var(--secondary)]" value="Revenue Share">Revenue Share</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider block mb-1 flex items-center gap-1">
                            <Percent size={12} className="text-[var(--accent)]" /> Minimum ROI Expected (%)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={form.min_roi}
                            onChange={(e) => setForm({ ...form, min_roi: e.target.value })}
                            placeholder="e.g. 15"
                            className="w-full rounded-xl border-transparent bg-transparent px-4 py-3 text-sm font-mono font-bold text-[var(--secondary)] placeholder-[var(--secondary)]/40 focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider block mb-1 flex items-center gap-1">
                            <Clock size={12} className="text-[var(--accent)]" /> Expected Investment Duration
                        </label>
                        <input
                            type="text"
                            value={form.investment_duration}
                            onChange={(e) => setForm({ ...form, investment_duration: e.target.value })}
                            placeholder="e.g. 3-5 Years, Long-term, 12 Months"
                            className="w-full rounded-xl border-transparent bg-transparent px-4 py-3 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/40 focus:outline-none transition neu-pressed-base shadow-inner font-medium focus:ring-1 focus:ring-[var(--accent)]"
                        />
                    </div>
                </div>
            </div>

            <div className="neu-flat-base p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4">
                    <h2 className="text-xl font-bold text-[var(--secondary)] flex items-center gap-2">
                        <LinkIcon size={18} className="text-[var(--accent)]" /> Previous Portfolios
                    </h2>
                    <span className="text-[10px] font-bold text-[var(--secondary)]/50 uppercase tracking-wider">
                        Max 3 Links
                    </span>
                </div>

                <div className="space-y-4">
                    {portfolioLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => handlePortfolioChange(index, e.target.value)}
                                placeholder="https://..."
                                className="w-full rounded-xl border-transparent bg-transparent px-4 py-3 text-sm text-[var(--accent)] font-bold placeholder-[var(--secondary)]/40 focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]"
                            />
                            {portfolioLinks.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePortfolioLink(index)}
                                    className="p-3 neu-btn text-rose-600 shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}

                    {portfolioLinks.length < 3 && (
                        <button
                            type="button"
                            onClick={addPortfolioLink}
                            className="flex items-center gap-2 text-xs font-bold text-[var(--secondary)] hover:text-[var(--accent)] transition bg-transparent p-2 rounded-lg"
                        >
                            <Plus size={14} /> Add Another Project Link
                        </button>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 text-sm neu-btn disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {saving ? "Publishing..." : isTargeted ? "Submit Private Counter-Offer" : "Publish Investor Bid Deck"}
                </button>
            </div>
        </form>
    );
}

export default function BidDeckBuilder({ investorId }: BidDeckBuilderProps) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-10"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>}>
            <BidDeckBuilderForm investorId={investorId} />
        </Suspense>
    );
}