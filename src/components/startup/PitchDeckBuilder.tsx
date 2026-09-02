"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Save, Loader2, AlertCircle, Target } from "lucide-react";

interface PitchDeckBuilderProps {
    existingDeck?: any;
    userId: string;
    targetBidId?: string;
}

export default function PitchDeckBuilder({ existingDeck, userId, targetBidId }: PitchDeckBuilderProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: existingDeck?.title || "",
        stage: existingDeck?.stage || "Pre-Seed",
        elevator_pitch: existingDeck?.elevator_pitch || "",
        funding_goal: existingDeck?.funding_goal || "",
        min_ticket: existingDeck?.min_ticket || "",
        valuation: existingDeck?.valuation || "",
        equity_offered: existingDeck?.equity_offered || "",
        traction: existingDeck?.traction || "",
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
            funding_goal: Number(formData.funding_goal) || 0,
            min_ticket: Number(formData.min_ticket) || 0,
            valuation: Number(formData.valuation) || 0,
            equity_offered: Number(formData.equity_offered) || 0,
            traction: formData.traction,
            use_of_funds: formData.use_of_funds,
            deck_url: formData.deck_url,
            target_bid_id: targetBidId || null, // FIX: Injects the linking ID
        };

        try {
            // 1. Save or Update the Pitch Deck
            if (currentPitchId) {
                const { error: updateError } = await supabase.from("pitch_decks").update(payload).eq("id", currentPitchId);
                if (updateError) throw updateError;
            } else {
                const { data: newDeck, error: insertError } = await supabase.from("pitch_decks").insert(payload).select().single();
                if (insertError) throw insertError;
                currentPitchId = newDeck.id;
            }

            // 2. INTERCEPTOR: If targetBidId exists, initiate the Deal Thread instantly
            if (targetBidId && currentPitchId) {
                const { data: bidData, error: bidError } = await supabase.from("investor_bid_decks").select("investor_id").eq("id", targetBidId).single();
                if (bidError) throw bidError;

                if (bidData) {
                    const { error: dealError } = await supabase.from("deal_negotiations").insert({
                        startup_id: userId,
                        investor_id: bidData.investor_id,
                        pitch_deck_id: currentPitchId,
                        bid_deck_id: targetBidId,
                        status: "Pending",
                        proposed_valuation: payload.valuation,
                        proposed_equity: payload.equity_offered,
                        ticket_size: payload.funding_goal,
                        ai_action_suggestions: ["Review Pitch", "Schedule Meeting", "Reject"],
                    });

                    if (dealError) throw dealError;

                    await supabase.from("notifications").insert({
                        user_id: bidData.investor_id,
                        actor_id: userId,
                        type: "deal_initiated",
                        message: "submitted a tailored pitch deck to your mandate.",
                        reference_id: targetBidId,
                    });
                }
            }

            router.push("/startup/dashboard");
            router.refresh();
        } catch (err: any) {
            console.error("Submission Error:", err);
            // Safe error property access
            setError(err?.message || "A database error occurred. Check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 shadow-xl">
            {targetBidId && (
                <div className="mb-8 flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl">
                    <Target className="text-cyan-400" size={24} />
                    <div>
                        <h3 className="text-sm font-bold text-cyan-300">Targeted Mandate Application</h3>
                        <p className="text-xs text-slate-400">Saving this pitch will instantly submit it and open a private deal negotiation thread.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                        <AlertCircle size={14} className="shrink-0" />
                        <span className="break-all">{error}</span>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pitch Title</label>
                        <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 focus:outline-none transition" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Startup Stage</label>
                        <select name="stage" value={formData.stage} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 focus:outline-none transition">
                            <option>Idea</option>
                            <option>Pre-Seed</option>
                            <option>Seed</option>
                            <option>Series A</option>
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Raise ($)</label>
                        <input required type="number" name="funding_goal" value={formData.funding_goal} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 focus:outline-none transition" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valuation ($)</label>
                        <input type="number" name="valuation" value={formData.valuation} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 focus:outline-none transition" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Equity Offered (%)</label>
                        <input type="number" name="equity_offered" value={formData.equity_offered} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 focus:outline-none transition" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Elevator Pitch</label>
                    <textarea required name="elevator_pitch" value={formData.elevator_pitch} onChange={handleChange} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-cyan-400 focus:outline-none transition"></textarea>
                </div>

                <button disabled={loading} type="submit" className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-500 px-6 py-4 text-sm font-black text-black shadow-lg hover:bg-cyan-400 transition disabled:opacity-50">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {targetBidId ? "Save Pitch & Submit Application" : "Save Pitch Deck"}
                </button>
            </form>
        </div>
    );
}