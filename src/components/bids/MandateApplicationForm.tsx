"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Send, Loader2, CheckCircle, ShieldAlert } from "lucide-react";

interface PitchDeckOption {
    id: string;
    title: string;
    stage: string;
    funding_goal: number;
    target_bid_id?: string | null;
}

interface MandateApplicationFormProps {
    bidId: string;
    investorId: string;
    startupId: string;
    pitches: PitchDeckOption[];
}

export default function MandateApplicationForm({ bidId, investorId, startupId, pitches }: MandateApplicationFormProps) {
    const router = useRouter();
    const availablePitches = pitches.filter(p => !p.target_bid_id);
    const [selectedPitch, setSelectedPitch] = useState<string>(availablePitches[0]?.id || "");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!selectedPitch) return;
        setLoading(true);

        const { error: lockError } = await supabase
            .from("pitch_decks")
            .update({ target_bid_id: bidId })
            .eq("id", selectedPitch);

        if (lockError) {
            setLoading(false);
            return;
        }

        // FIX: Added .select().single() to extract the new Deal Room ID
        const { data: newDeal, error } = await supabase.from("deal_negotiations").insert({
            startup_id: startupId,
            investor_id: investorId,
            pitch_deck_id: selectedPitch,
            bid_deck_id: bidId,
            status: "Pending",
        }).select().single();

        if (!error && newDeal) {
            // FIX: Now securely routing to the exact Deal Room ID
            await supabase.from("notifications").insert({
                user_id: investorId,
                actor_id: startupId,
                type: "deal_initiated",
                message: "submitted a pitch deck to your mandate.",
                reference_id: newDeal.id
            });

            setSuccess(true);
            setTimeout(() => {
                router.push("/startup/dashboard");
            }, 2000);
        } else {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-4 neu-pressed-base border-transparent shadow-inner text-emerald-600">
                <CheckCircle size={24} className="mb-2" />
                <span className="text-sm font-bold">Deal Thread Initiated</span>
                <span className="text-[10px] font-bold text-[var(--secondary)]/50 mt-1">Pitch is now locked to this mandate.</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 neu-flat-base p-6">
            {availablePitches.length > 0 ? (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)]/60">
                            Select Pitch Deck (Locks upon submission)
                        </label>
                        <select
                            value={selectedPitch}
                            onChange={(e) => setSelectedPitch(e.target.value)}
                            className="w-full bg-transparent neu-pressed-base border-transparent shadow-inner p-3 text-sm font-bold text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
                        >
                            {availablePitches.map((pitch) => (
                                <option key={pitch.id} value={pitch.id} className="bg-[var(--primary)] text-[var(--secondary)]">
                                    {pitch.title || "Untitled"} • {pitch.stage || "Pre-Seed"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedPitch}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 neu-btn text-xs disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {loading ? "Initiating Deal..." : "Submit & Lock Selected Pitch"}
                    </button>
                </>
            ) : (
                <div className="neu-pressed-base p-6 text-center border-transparent shadow-inner space-y-2">
                    <ShieldAlert className="mx-auto text-rose-600 mb-2" size={28} />
                    <p className="text-sm font-bold text-[var(--secondary)]">No Available Pitch Decks</p>
                    <p className="text-[10px] font-medium text-[var(--secondary)]/60 leading-relaxed max-w-xs mx-auto">
                        Your existing pitch decks are already locked to other active mandates. You must create a new pitch deck to apply for this bid.
                    </p>
                </div>
            )}
        </div>
    );
}