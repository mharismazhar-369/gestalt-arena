"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Send, CheckCircle, AlertCircle, Loader2, PlusCircle } from "lucide-react";

interface SubmitPitchButtonProps {
    bidDeckId: string;
    startupId: string;
    pitchDeckId: string | null;
    alreadySubmitted: boolean;
}

export default function SubmitPitchButton({ bidDeckId, startupId, pitchDeckId, alreadySubmitted }: SubmitPitchButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(alreadySubmitted);

    const handleSubmit = async () => {
        if (!pitchDeckId) return;
        setLoading(true);
        setError(null);

        // 1. Insert the submission
        const { error: submitError } = await supabase
            .from("investor_bid_submissions")
            .insert({
                bid_deck_id: bidDeckId,
                startup_id: startupId,
                pitch_deck_id: pitchDeckId,
                status: "pending",
            });

        if (submitError) {
            setError(submitError.message);
            setLoading(false);
            return;
        }

        // 2. Fetch investor ID and trigger notification
        const { data: bidData } = await supabase.from("investor_bid_decks").select("investor_id").eq("id", bidDeckId).single();
        if (bidData) {
            await supabase.from("notifications").insert({
                user_id: bidData.investor_id,
                actor_id: startupId,
                type: "submission",
                message: "submitted a pitch deck to your capital mandate.",
                reference_id: bidDeckId
            });
        }

        setSuccess(true);
        setLoading(false);
        router.refresh();
    };

    if (success) {
        return (
            <div className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-4 text-sm font-bold text-emerald-400">
                <CheckCircle size={18} /> Pitch Submitted Successfully
            </div>
        );
    }

    // ISSUE 1 FIX: Route the founder to create a pitch if they don't have one
    if (!pitchDeckId) {
        return (
            <div className="space-y-3 w-full">
                <Link
                    href="/startup/pitch/build"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-violet-500 px-6 py-4 text-sm font-black text-white shadow-lg hover:scale-105 transition-all"
                >
                    <PlusCircle size={18} /> Create Pitch Deck to Apply
                </Link>
                <p className="text-center text-xs text-slate-500 font-bold">
                    You need an active pitch deck to submit to this mandate.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 w-full">
            {error && (
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                    <AlertCircle size={14} /> {error}
                </div>
            )}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 text-sm font-black text-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? "Submitting..." : "Submit Pitch Deck to Mandate"}
            </button>
        </div>
    );
}