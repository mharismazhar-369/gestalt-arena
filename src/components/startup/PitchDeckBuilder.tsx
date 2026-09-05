"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Save, Loader2, AlertCircle, Target, Building, TrendingUp, Users, DollarSign, Activity, Link as LinkIcon, FileText } from "lucide-react";

interface PitchDeckBuilderProps {
    existingDeck?: any;
    userId: string;
    targetBidId?: string;
}

export default function PitchDeckBuilder({ existingDeck, userId, targetBidId }: PitchDeckBuilderProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Enhanced Form State
    const [formData, setFormData] = useState({
        title: existingDeck?.title || "",
        stage: existingDeck?.stage || "Pre-Seed",
        elevator_pitch: existingDeck?.elevator_pitch || "",
        problem_statement: existingDeck?.problem_statement || "",
        solution: existingDeck?.solution || "",
        market_size: existingDeck?.market_size || "",
        business_model: existingDeck?.business_model || "",
        competitors: existingDeck?.competitors || "",
        funding_goal: existingDeck?.funding_goal || "",
        min_ticket: existingDeck?.min_ticket || "",
        valuation: existingDeck?.valuation || "",
        equity_offered: existingDeck?.equity_offered || "",
        traction: existingDeck?.traction || "",
        revenue: existingDeck?.revenue || "",
        runway_months: existingDeck?.runway_months || "",
        use_of_funds: existingDeck?.use_of_funds || "",
        deck_url: existingDeck?.deck_url || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let currentPitchId = existingDeck?.id;

        const payload = {
            user_id: userId,
            title: formData.title,
            stage: formData.stage,
            elevator_pitch: formData.elevator_pitch,
            problem_statement: formData.problem_statement,
            solution: formData.solution,
            market_size: formData.market_size,
            business_model: formData.business_model,
            competitors: formData.competitors,
            funding_goal: Number(formData.funding_goal) || 0,
            min_ticket: Number(formData.min_ticket) || 0,
            valuation: Number(formData.valuation) || 0,
            equity_offered: Number(formData.equity_offered) || 0,
            traction: formData.traction,
            revenue: Number(formData.revenue) || 0,
            runway_months: Number(formData.runway_months) || 0,
            use_of_funds: formData.use_of_funds,
            deck_url: formData.deck_url,
            target_bid_id: targetBidId || null,
        };

        try {
            if (currentPitchId) {
                const { error: updateError } = await supabase.from("pitch_decks").update(payload).eq("id", currentPitchId);
                if (updateError) throw updateError;
            } else {
                const { data: newDeck, error: insertError } = await supabase.from("pitch_decks").insert(payload).select().single();
                if (insertError) throw insertError;
                currentPitchId = newDeck.id;
            }

            if (targetBidId && currentPitchId) {
                const { data: bidData, error: bidError } = await supabase.from("investor_bid_decks").select("investor_id").eq("id", targetBidId).single();
                if (bidError) throw bidError;

                if (bidData) {
                    // FIX: Extracting the new deal room ID directly
                    const { data: newDeal, error: dealError } = await supabase.from("deal_negotiations").insert({
                        startup_id: userId,
                        investor_id: bidData.investor_id,
                        pitch_deck_id: currentPitchId,
                        bid_deck_id: targetBidId,
                        status: "Pending",
                    }).select().single();

                    if (dealError) throw dealError;

                    // FIX: Sending the specific Deal ID to the ledger
                    await supabase.from("notifications").insert({
                        user_id: bidData.investor_id,
                        actor_id: userId,
                        type: "deal_initiated",
                        message: "submitted a tailored pitch deck to your mandate.",
                        reference_id: newDeal.id,
                    });
                }
            }

            router.push("/startup/dashboard");
            router.refresh();
        } catch (err: any) {
            console.error("Submission Error:", err);
            setError(err?.message || "A database error occurred. Check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="neu-flat-base p-8 space-y-8">
            {targetBidId && (
                <div className="mb-8 flex items-center gap-4 neu-pressed-base border-transparent shadow-inner p-5 rounded-2xl">
                    <Target className="text-[var(--accent)] shrink-0" size={32} />
                    <div>
                        <h3 className="text-sm font-bold text-[var(--secondary)]">Targeted Mandate Application</h3>
                        <p className="text-xs text-[var(--secondary)]/70 font-medium">Saving this pitch will instantly submit it and open a private deal negotiation thread[cite: 23].</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 neu-pressed-base border-transparent shadow-inner rounded-lg p-4">
                        <AlertCircle size={16} className="shrink-0" />
                        <span className="break-all">{error}</span>
                    </div>
                )}

                {/* Section 1: Overview */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Building size={18} className="text-[var(--accent)]" /> Core Overview
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Pitch Title</label>
                            <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Acme Corp Seed Round" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Startup Stage</label>
                            <select name="stage" value={formData.stage} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]">
                                <option className="bg-[var(--primary)]">Idea</option>
                                <option className="bg-[var(--primary)]">Pre-Seed</option>
                                <option className="bg-[var(--primary)]">Seed</option>
                                <option className="bg-[var(--primary)]">Series A</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Elevator Pitch (Short Summary)</label>
                        <textarea required name="elevator_pitch" value={formData.elevator_pitch} onChange={handleChange} rows={2} placeholder="In one sentence, what do you do?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                    </div>
                </div>

                {/* Section 2: The Business Case */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Target size={18} className="text-[var(--accent)]" /> Business Case
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Problem Statement</label>
                            <textarea required name="problem_statement" value={formData.problem_statement} onChange={handleChange} rows={3} placeholder="What critical problem are you solving?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Your Solution</label>
                            <textarea required name="solution" value={formData.solution} onChange={handleChange} rows={3} placeholder="How does your product solve this uniquely?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Market Size (TAM/SAM/SOM)</label>
                            <textarea name="market_size" value={formData.market_size} onChange={handleChange} rows={3} placeholder="Provide data on your target market..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Business Model & Revenue Streams</label>
                            <textarea name="business_model" value={formData.business_model} onChange={handleChange} rows={3} placeholder="How do you make money?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Competitive Landscape</label>
                        <input type="text" name="competitors" value={formData.competitors} onChange={handleChange} placeholder="Who are your main competitors? What is your moat?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                {/* Section 3: Financials & Metrics */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <TrendingUp size={18} className="text-emerald-600" /> Financials & Metrics
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1"><DollarSign size={10} className="text-emerald-600" /> Target Raise</label>
                            <input required type="number" name="funding_goal" value={formData.funding_goal} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-emerald-600 focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1"><DollarSign size={10} className="text-[var(--accent)]" /> Min Ticket Size</label>
                            <input type="number" name="min_ticket" value={formData.min_ticket} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1"><Activity size={10} className="text-[var(--accent)]" /> Valuation (Cap)</label>
                            <input type="number" name="valuation" value={formData.valuation} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider flex items-center gap-1"><Users size={10} className="text-[var(--accent)]" /> Equity Offered (%)</label>
                            <input type="number" step="0.1" name="equity_offered" value={formData.equity_offered} onChange={handleChange} className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Current Revenue/ARR</label>
                            <input type="number" name="revenue" value={formData.revenue} onChange={handleChange} placeholder="Optional" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Runway (Months)</label>
                            <input type="number" name="runway_months" value={formData.runway_months} onChange={handleChange} placeholder="Optional" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-mono font-bold text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Current Traction / Milestones</label>
                            <textarea name="traction" value={formData.traction} onChange={handleChange} rows={3} placeholder="Key achievements to date..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Use of Funds</label>
                            <textarea name="use_of_funds" value={formData.use_of_funds} onChange={handleChange} rows={3} placeholder="How will you spend the raised capital?" className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-medium text-[var(--secondary)] focus:outline-none transition neu-pressed-base shadow-inner resize-none focus:ring-1 focus:ring-[var(--accent)]"></textarea>
                        </div>
                    </div>
                </div>

                {/* Section 4: Attachments */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <LinkIcon size={18} className="text-[var(--accent)]" /> Media & Attachments
                    </h2>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase tracking-wider">Full Pitch Deck URL (PDF/DocSend/Google Slides)</label>
                        <input type="url" name="deck_url" value={formData.deck_url} onChange={handleChange} placeholder="https://..." className="w-full bg-transparent border-transparent rounded-xl p-4 text-sm font-bold text-[var(--accent)] focus:outline-none transition neu-pressed-base shadow-inner focus:ring-1 focus:ring-[var(--accent)]" />
                    </div>
                </div>

                <div className="pt-6 border-t border-[var(--secondary)]/10 flex justify-end">
                    <button disabled={loading} type="submit" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl neu-btn text-sm disabled:opacity-50">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {targetBidId ? "Save Pitch & Submit Application" : "Save Pitch Deck"}
                    </button>
                </div>
            </form>
        </div>
    );
}