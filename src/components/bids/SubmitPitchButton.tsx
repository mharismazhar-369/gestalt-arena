"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

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
        if (!pitchDeckId) {
            setError("You must create a Pitch Deck before applying.");
            return;
        }

        setLoading(true);
        setError(null);

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
        } else {
            setSuccess(true);
            setLoading(false);
            router.refresh();
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-4 text-sm font-bold text-emerald-400">
                <CheckCircle size={18} /> Pitch Submitted Successfully
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
                disabled={loading || !pitchDeckId}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 text-sm font-black text-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? "Submitting..." : "Submit Pitch Deck to Mandate"}
            </button>
            {!pitchDeckId && (
                <p className="text-center text-xs text-slate-500 font-bold">
                    Please generate your Pitch Deck in the Startup Dashboard first.
                </p>
            )}
        </div>
    );
}