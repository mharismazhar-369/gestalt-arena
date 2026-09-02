"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, MessageCircle, Gavel, Star, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface PitchActionBarProps {
    pitchId: string;
    startupId: string;
    currentUserId: string;
}

export default function PitchActionBar({ pitchId, startupId, currentUserId }: PitchActionBarProps) {
    const router = useRouter();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [showNegotiate, setShowNegotiate] = useState(false);

    const handleInterested = async () => {
        const newStatus = !isBookmarked;
        setIsBookmarked(newStatus);

        if (newStatus && currentUserId !== startupId) {
            await supabase.from("notifications").insert({
                user_id: startupId,
                actor_id: currentUserId,
                type: "interested",
                message: "has shortlisted your pitch deck.",
                reference_id: pitchId
            });
        }
    };

    // Fix 404: Route the investor to create a mandate targeting this specific pitch
    const handleBid = () => {
        router.push(`/investor/bids/create?target_pitch=${pitchId}`);
    };

    // Simulate database rating update
    const handleRate = async (score: number) => {
        setRating(score);
        if (currentUserId !== startupId) {
            await supabase.from("notifications").insert({
                user_id: startupId,
                actor_id: currentUserId,
                type: "rating",
                message: `rated your pitch deck ${score} stars.`,
                reference_id: pitchId
            });
            // Update actual pitch rating here when table is ready
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50">
            {showNegotiate ? (
                <div className="trionn-glass-card rounded-2xl border border-violet-500/50 bg-[#0a0a0a]/95 p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <h3 className="font-bold text-white flex items-center gap-2"><MessageCircle size={18} className="text-violet-400" /> Start Negotiation</h3>
                        <button onClick={() => setShowNegotiate(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                    </div>
                    <p className="text-xs text-slate-400">The direct messaging module is currently in development for Phase 2. To negotiate, please connect via the founder's profile.</p>
                    <button onClick={() => setShowNegotiate(false)} className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-bold w-full">Acknowledge</button>
                </div>
            ) : (
                <div className="trionn-glass-card rounded-2xl border border-cyan-500/30 bg-[#0a0a0a]/90 p-4 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Rate Idea</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => handleRate(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    size={22}
                                    className={`${(hoveredStar || rating) >= star ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleInterested}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition border ${isBookmarked
                                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                                : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                                }`}
                        >
                            <Bookmark size={18} className={isBookmarked ? "fill-cyan-400" : ""} />
                            {isBookmarked ? "Shortlisted" : "Interested"}
                        </button>
                        <button
                            onClick={() => setShowNegotiate(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold transition"
                        >
                            <MessageCircle size={18} />
                            Negotiate
                        </button>
                        <button
                            onClick={handleBid}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black transition"
                        >
                            <Gavel size={18} />
                            Bid
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}