"use client";

import { useRouter } from "next/navigation";
import { Send, CheckCircle, FileEdit } from "lucide-react";

interface SubmitPitchButtonProps {
    bidDeckId: string;
    startupId: string;
    pitchDeckId: string | null;
    alreadySubmitted: boolean;
}

export default function SubmitPitchButton({ bidDeckId, alreadySubmitted }: SubmitPitchButtonProps) {
    const router = useRouter();

    if (alreadySubmitted) {
        return (
            <div className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-4 text-sm font-bold text-emerald-400">
                <CheckCircle size={18} /> Pitch Application Submitted
            </div>
        );
    }

    // Route the founder to a tailored application builder instead of submitting blindly
    const handleApplyRoute = () => {
        router.push(`/bids/${bidDeckId}/apply`);
    };

    return (
        <div className="space-y-3 w-full">
            <button
                onClick={handleApplyRoute}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 text-sm font-black text-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
            >
                <FileEdit size={18} />
                Tailor Pitch & Apply
            </button>
            <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                You will be able to review and customize your pitch before sending.
            </p>
        </div>
    );
}