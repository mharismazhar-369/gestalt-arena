"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Star, MessageCircle, Gavel, Bookmark, Loader2 } from "lucide-react";

interface EmbeddedInvestorActionsProps {
    pitchId: string;
    startupId: string;
    currentUserId: string;
}

export default function EmbeddedInvestorActions({ pitchId, startupId, currentUserId }: EmbeddedInvestorActionsProps) {
    const router = useRouter();
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: ratingData } = await supabase
                .from("pitch_deck_ratings")
                .select("score")
                .eq("pitch_deck_id", pitchId)
                .eq("investor_id", currentUserId)
                .single();

            if (ratingData) setRating(ratingData.score);

            const { data: interestData } = await supabase
                .from("pitch_deck_interests")
                .select("id")
                .eq("pitch_deck_id", pitchId)
                .eq("investor_id", currentUserId)
                .single();

            if (interestData) setIsBookmarked(true);
        };
        fetchUserData();
    }, [pitchId, currentUserId]);

    const handleRate = async (score: number) => {
        setRating(score);

        const { data: existing } = await supabase
            .from("pitch_deck_ratings")
            .select("id")
            .eq("pitch_deck_id", pitchId)
            .eq("investor_id", currentUserId)
            .single();

        if (existing) {
            await supabase.from("pitch_deck_ratings").update({ score }).eq("id", existing.id);
        } else {
            await supabase.from("pitch_deck_ratings").insert({ pitch_deck_id: pitchId, investor_id: currentUserId, score });
            await supabase.from("notifications").insert({
                user_id: startupId,
                actor_id: currentUserId,
                type: "rating",
                message: `rated your pitch deck ${score} stars.`,
                reference_id: pitchId
            });
        }
    };

    const handleInterested = async () => {
        const newStatus = !isBookmarked;
        setIsBookmarked(newStatus);

        if (newStatus) {
            await supabase.from("pitch_deck_interests").insert({ pitch_deck_id: pitchId, investor_id: currentUserId });
            await supabase.from("notifications").insert({
                user_id: startupId,
                actor_id: currentUserId,
                type: "interested",
                message: "has shortlisted your pitch deck.",
                reference_id: pitchId
            });
        } else {
            await supabase.from("pitch_deck_interests").delete().match({ pitch_deck_id: pitchId, investor_id: currentUserId });
        }
    };

    const handleNegotiate = async () => {
        setLoading(true);

        const { data: existingDeal } = await supabase
            .from("deal_negotiations")
            .select("id")
            .eq("pitch_deck_id", pitchId)
            .eq("investor_id", currentUserId)
            .single();

        if (existingDeal) {
            router.push(`/negotiations/${existingDeal.id}`);
            return;
        }

        // Create the Deal Room
        const { data: newDeal, error } = await supabase
            .from("deal_negotiations")
            .insert({
                startup_id: startupId,
                investor_id: currentUserId,
                pitch_deck_id: pitchId,
                status: "Pending",
            })
            .select()
            .single();

        if (!error && newDeal) {
            // FIX: Trigger the notification passing the newDeal.id as the reference_id
            await supabase.from("notifications").insert({
                user_id: startupId,
                actor_id: currentUserId,
                type: "negotiate",
                message: "opened a private negotiation room regarding your pitch.",
                reference_id: newDeal.id
            });
            router.push(`/negotiations/${newDeal.id}`);
        } else {
            setLoading(false);
        }
    };

    const handleBid = () => {
        router.push(`/investor/bids/create?target_pitch=${pitchId}`);
    };

    return (
        <div className="neu-flat-base p-6 md:p-8 flex flex-col xl:flex-row items-center justify-between gap-6 w-full mt-8">
            <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-start border-b xl:border-b-0 xl:border-r border-[var(--secondary)]/10 pb-4 xl:pb-0 xl:pr-8">
                <span className="text-xs font-bold text-[var(--secondary)]/60 uppercase tracking-wider">
                    Rate Idea
                </span>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => handleRate(star)}
                            className="transition-transform hover:scale-110 p-1 focus:outline-none"
                        >
                            <Star
                                size={26}
                                className={`transition-all duration-300 ${(hoverRating || rating) >= star
                                    ? "fill-[var(--accent)] text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent)]"
                                    : "text-[var(--secondary)]/20"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4">
                <button
                    onClick={handleInterested}
                    className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 ${isBookmarked
                        ? "neu-pressed-base border-transparent shadow-inner text-[var(--accent)]"
                        : "bg-transparent text-[var(--secondary)] hover:text-[var(--accent)] shadow-[4px_4px_10px_rgba(0,0,0,0.3),-4px_-4px_10px_rgba(255,255,255,0.03)]"
                        }`}
                >
                    <Bookmark size={18} className={isBookmarked ? "fill-[var(--accent)]" : ""} />
                    {isBookmarked ? "Shortlisted" : "Interested"}
                </button>

                <button
                    onClick={handleNegotiate}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-8 py-4 text-sm neu-btn disabled:opacity-50"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
                    {loading ? "Opening Room..." : "Negotiate"}
                </button>

                <button
                    onClick={handleBid}
                    className="flex items-center justify-center gap-2 px-8 py-4 text-sm neu-btn"
                >
                    <Gavel size={18} />
                    Bid
                </button>
            </div>
        </div>
    );
}