"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Star, Eye, DollarSign } from "lucide-react";

interface PitchDeckActionBarProps {
    deckId: string;
    investorId: string;
    founderId: string;
}

export default function PitchDeckActionBar({ deckId, investorId, founderId }: PitchDeckActionBarProps) {
    const [isStarred, setIsStarred] = useState(false);
    const [isInterested, setIsInterested] = useState(false);
    const [hasBid, setHasBid] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!investorId || !deckId) return;

        const checkInteractions = async () => {
            const [starRes, interestRes, bidRes] = await Promise.all([
                supabase.from("pitch_deck_stars").select("id").eq("investor_id", investorId).eq("pitch_deck_id", deckId).maybeSingle(),
                supabase.from("pitch_deck_interests").select("id").eq("investor_id", investorId).eq("pitch_deck_id", deckId).maybeSingle(),
                supabase.from("pitch_deck_bids").select("id").eq("investor_id", investorId).eq("pitch_deck_id", deckId).limit(1)
            ]);

            if (starRes.data) setIsStarred(true);
            if (interestRes.data) setIsInterested(true);
            if (bidRes.data && bidRes.data.length > 0) setHasBid(true);
            setLoading(false);
        };

        checkInteractions();
    }, [investorId, deckId]);

    const toggleStar = async () => {
        setIsStarred(!isStarred);
        if (!isStarred) {
            await supabase.from("pitch_deck_stars").insert({ investor_id: investorId, pitch_deck_id: deckId });
        } else {
            await supabase.from("pitch_deck_stars").delete().match({ investor_id: investorId, pitch_deck_id: deckId });
        }
    };

    const toggleInterest = async () => {
        setIsInterested(!isInterested);
        if (!isInterested) {
            await supabase.from("pitch_deck_interests").insert({ investor_id: investorId, pitch_deck_id: deckId });
            await supabase.from("notifications").insert({
                user_id: founderId, actor_id: investorId, type: "interest", message: "showed interest in your pitch deck."
            });
        } else {
            await supabase.from("pitch_deck_interests").delete().match({ investor_id: investorId, pitch_deck_id: deckId });
        }
    };

    const handleBid = async () => {
        if (hasBid) return;
        const bidAmount = prompt("Enter your initial bid allocation ($):");
        if (!bidAmount || isNaN(Number(bidAmount))) return;

        await supabase.from("pitch_deck_bids").insert({
            investor_id: investorId, pitch_deck_id: deckId, bid_amount: Number(bidAmount)
        });

        await supabase.from("notifications").insert({
            user_id: founderId, actor_id: investorId, type: "bid", message: `placed a $${bidAmount} bid on your pitch deck.`
        });
        setHasBid(true);
    };

    if (loading) return <div className="h-10 w-full animate-pulse rounded-xl bg-slate-900/50"></div>;

    return (
        <div className="flex items-center gap-3 mt-4 border-t border-white/10 pt-4">
            <button
                onClick={toggleStar}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${isStarred ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
            >
                <Star size={14} className={isStarred ? "fill-amber-400" : ""} /> {isStarred ? "Starred" : "Star"}
            </button>

            <button
                onClick={toggleInterest}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${isInterested ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
            >
                <Eye size={14} /> {isInterested ? "Tracking" : "Interested"}
            </button>

            <button
                onClick={handleBid}
                disabled={hasBid}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${hasBid ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"}`}
            >
                <DollarSign size={14} /> {hasBid ? "Bid Placed" : "Bid"}
            </button>
        </div>
    );
}