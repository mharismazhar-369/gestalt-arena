"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Rocket, Save } from "lucide-react";

export default function PitchDeckBuilder({ existingDeck, userId }: { existingDeck?: any, userId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: existingDeck?.title || "",
        company_name: existingDeck?.company_name || "",
        elevator_pitch: existingDeck?.elevator_pitch || "",
        stage: existingDeck?.stage || "",
        funding_goal: existingDeck?.funding_goal || "",
        min_ticket: existingDeck?.min_ticket || "",
        valuation: existingDeck?.valuation || "",
        traction: existingDeck?.traction || "",
        deck_url: existingDeck?.deck_url || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (existingDeck?.id) {
            // Update existing pitch deck
            const { error: updateError } = await supabase
                .from("pitch_decks")
                .update(formData)
                .eq("id", existingDeck.id)
                .eq("user_id", userId);

            if (updateError) setError(updateError.message);
        } else {
            // Create new pitch deck
            const { error: insertError } = await supabase
                .from("pitch_decks")
                .insert([{ ...formData, user_id: userId }]);

            if (insertError) setError(insertError.message);
        }

        setLoading(false);

        if (!error) {
            // Route back to the showcase view to see the final result
            router.push(`/startup/${userId}/pitch`);
            router.refresh();
        }
    }

    return (
        <div className="trionn-glass-card rounded-3xl border border-violet-500/30 bg-[#0a0a0a]/90 p-8 md:p-10 shadow-2xl">
            <div className="mb-8 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-400">
                    <Rocket size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white">
                        {existingDeck ? "Edit Pitch Deck" : "Create Pitch Deck"}
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        Publish your deal to the Investor Bidding Engine.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Project / Deal Title *</label>
                        <input required name="title" value={formData.title} onChange={handleChange} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 outline-none" placeholder="e.g., AI Deal Flow Automation" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Company Name *</label>
                        <input required name="company_name" value={formData.company_name} onChange={handleChange} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 outline-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Elevator Pitch *</label>
                    <textarea required name="elevator_pitch" value={formData.elevator_pitch} onChange={handleChange} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 outline-none min-h-[80px]" placeholder="1-2 sentences describing the core value proposition..." />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Stage</label>
                        <input name="stage" value={formData.stage} onChange={handleChange} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 outline-none" placeholder="e.g., Seed" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Target Raise ($)</label>
                        <input name="funding_goal" value={formData.funding_goal} onChange={handleChange} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 outline-none" placeholder="$500,000" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Valuation</label>
                        <input name="valuation" value={formData.valuation} onChange={handleChange} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 outline-none" placeholder="$4M Post-money" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Traction Summary</label>
                        <input name="traction" value={formData.traction} onChange={handleChange} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 outline-none" placeholder="$10k MRR, 1000 Users" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Minimum Ticket Size</label>
                        <input name="min_ticket" value={formData.min_ticket} onChange={handleChange} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 outline-none" placeholder="$25,000" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">External Pitch Deck URL (PDF/Drive)</label>
                    <input name="deck_url" type="url" value={formData.deck_url} onChange={handleChange} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 outline-none" placeholder="https://..." />
                </div>

                {error && <p className="text-sm text-red-400 font-bold">{error}</p>}

                <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 rounded-xl bg-violet-500 p-4 font-bold text-white transition hover:bg-violet-600 disabled:opacity-60">
                    <Save size={20} />
                    {loading ? "Publishing to Network..." : (existingDeck ? "Update Pitch Deck" : "Publish to Bidding Engine")}
                </button>
            </form>
        </div>
    );
}