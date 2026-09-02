"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Send, Loader2, CheckCircle } from "lucide-react";

interface PitchDeckOption {
    id: string;
    title: string;
    stage: string;
    funding_goal: number;
}

interface MandateApplicationFormProps {
    bidId: string;
    investorId: string;
    startupId: string;
    pitches: PitchDeckOption[];
}

export default function MandateApplicationForm({ bidId, investorId, startupId, pitches }: MandateApplicationFormProps) {
    const router = useRouter();
    const [selectedPitch, setSelectedPitch] = useState<string>(pitches[0]?.id || "");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!selectedPitch) return;
        setLoading(true);

        // Create the private Deal Thread
        const { error } = await supabase.from("deal_negotiations").insert({
            startup_id: startupId,
            investor_id: investorId,
            pitch_deck_id: selectedPitch,
            bid_deck_id: bidId,
            status: "Pending",
            ai_action_suggestions: ["Review Pitch", "Schedule Meeting", "Reject"]
        });

        if (!error) {
            // Trigger Notification
            await supabase.from("notifications").insert({
                user_id: investorId,
                actor_id: startupId,
                type: "deal_initiated",
                message: "submitted a pitch deck to your mandate.",
                reference_id: bidId
            });

            setSuccess(true);
            setTimeout(() => {
                router.push("/startup/dashboard"); // Route to a deal management view later
            }, 2000);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <CheckCircle size={24} className="mb-2" />
                <span className="text-sm font-bold">Deal Thread Initiated</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <select
                value={selectedPitch}
                onChange={(e) => setSelectedPitch(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-violet-500 transition"
            >
                {pitches.map((pitch) => (
                    <option key={pitch.id} value={pitch.id}>
                        {pitch.title || "Untitled"} • {pitch.stage || "Pre-Seed"}
                    </option>
                ))}
            </select>

            <button
                onClick={handleSubmit}
                disabled={loading || !selectedPitch}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-violet-500 hover:border-violet-500 transition disabled:opacity-50"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? "Initiating Deal..." : "Submit Selected Pitch"}
            </button>
        </div>
    );
}