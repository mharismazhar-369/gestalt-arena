"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, MessageCircle, Gavel, Star } from "lucide-react";
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

    const handleInterested = async () => {
        const newStatus = !isBookmarked;
        setIsBookmarked(newStatus);

        // 1. Insert into bookmarks/investor_interests table here in the future

        // 2. Trigger Notification
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

    const handleNegotiate = () => {
        router.push(`/messages/new?opportunity=${pitchId}&startup=${startupId}`);
    };

    const handleBid = () => {
        router.push(`/bidding/${pitchId}/new`);
    };

    const handleRate = async (score: number) => {
        setRating(score);
        // 1. Insert/Update pitch_deck_ratings table here in the future

        // 2. Trigger Notification
        if (currentUserId !== startupId) {
            await supabase.from("notifications").insert({
                user_id: startupId,
                actor_id: currentUserId,
                type: "rating",
                message: `rated your pitch deck ${score} stars.`,
                reference_id: pitchId
            });
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50">
            <div className="trionn-glass-card rounded-2xl border border-cyan-500/30 bg-[#0a0a0a]/90 p-4 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Rating Component */}
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

                {/* Action Buttons */}
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
                        onClick={handleNegotiate}
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
        </div>
    );
}