import React from "react";
import { createClient } from "@/lib/supabase/server";
import {
    Target, Wallet, TrendingUp, Users, Activity, Calendar,
    Lightbulb, CheckCircle2, Globe, Briefcase, Eye, Star, Presentation
} from "lucide-react";
import EmbeddedInvestorActions from "./EmbeddedInvestorActions";

export default async function PitchDeckViewer({ pitchId }: { pitchId: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch Pitch Deck & Founder Profile
    const { data: pitchDeck, error } = await supabase
        .from("pitch_decks")
        .select(`*, profiles:user_id (company_name, nickname)`)
        .eq("id", pitchId)
        .single();

    if (error || !pitchDeck) {
        return (
            <div className="neu-pressed-base border-transparent shadow-inner p-6 text-center text-rose-600 text-sm font-bold">
                Pitch deck data could not be retrieved.
            </div>
        );
    }

    const isOwner = user?.id === pitchDeck.user_id;

    // 2. Track View (If current user is an investor viewing a startup's deck)
    if (user && !isOwner) {
        await supabase.from("pitch_deck_views").insert({
            pitch_deck_id: pitchId,
            viewer_id: user.id
        });
    }

    // 3. Aggregate Actual Views & Ratings from DB
    const { count: viewCount } = await supabase
        .from("pitch_deck_views")
        .select("*", { count: "exact", head: true })
        .eq("pitch_deck_id", pitchId);

    const { data: ratingsData } = await supabase
        .from("pitch_deck_ratings")
        .select("score")
        .eq("pitch_deck_id", pitchId);

    let avgRating = 0;
    if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, curr) => acc + curr.score, 0);
        avgRating = Number((sum / ratingsData.length).toFixed(1));
    }

    // 4. Formatting Helpers
    const fundingGoal = pitchDeck.funding_goal ? `$${Number(pitchDeck.funding_goal).toLocaleString()}` : "TBD";
    const minTicket = pitchDeck.min_ticket ? `$${Number(pitchDeck.min_ticket).toLocaleString()}` : "Flexible";
    const valuation = pitchDeck.valuation ? `$${Number(pitchDeck.valuation).toLocaleString()}` : "TBD";
    const revenue = pitchDeck.revenue ? `$${Number(pitchDeck.revenue).toLocaleString()}` : "$0";

    return (
        <div className="space-y-6 w-full text-[var(--secondary)]">

            {/* Master Header Card */}
            <div className="neu-flat-base p-8 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase text-[var(--accent)]">
                                {pitchDeck.stage || "Pre-Seed"} Round
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-[var(--secondary)] leading-tight">
                            {pitchDeck.title || "Untitled Pitch"}
                        </h1>
                        <p className="text-sm text-[var(--secondary)]/80 font-medium italic border-l-4 border-[var(--accent)] pl-4 py-1">
                            {pitchDeck.elevator_pitch || "No elevator pitch provided."}
                        </p>
                    </div>

                    <div className="flex gap-6 neu-pressed-base border-transparent shadow-inner p-4 rounded-2xl shrink-0">
                        <div className="flex flex-col items-center justify-center space-y-1">
                            <div className="flex items-center gap-1.5 text-[var(--accent)]">
                                <Eye size={18} />
                                <span className="text-lg font-bold">{viewCount || 0}</span>
                            </div>
                            <span className="text-[10px] text-[var(--secondary)]/50 uppercase tracking-wider font-bold">Total Views</span>
                        </div>
                        <div className="w-px bg-[var(--secondary)]/10" />
                        <div className="flex flex-col items-center justify-center space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-500">
                                <Star size={18} fill="currentColor" />
                                <span className="text-lg font-bold">{avgRating}</span>
                            </div>
                            <span className="text-[10px] text-[var(--secondary)]/50 uppercase tracking-wider font-bold">Ratings</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financials & Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <Target className="text-emerald-600 mb-1" size={16} />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Raise Target</p>
                    <p className="text-base font-bold text-[var(--secondary)]">{fundingGoal}</p>
                </div>
                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <Wallet className="text-[var(--accent)] mb-1" size={16} />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Min Ticket</p>
                    <p className="text-base font-bold text-[var(--secondary)]">{minTicket}</p>
                </div>
                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <TrendingUp className="text-[var(--accent)] mb-1" size={16} />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Valuation Cap</p>
                    <p className="text-base font-bold text-[var(--secondary)]">{valuation}</p>
                </div>
                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <Users className="text-[var(--accent)] mb-1" size={16} />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Equity Offered</p>
                    <p className="text-base font-bold text-[var(--secondary)]">{pitchDeck.equity_offered ? `${pitchDeck.equity_offered}%` : "TBD"}</p>
                </div>
                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <Activity className="text-emerald-600 mb-1" size={16} />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Current ARR</p>
                    <p className="text-base font-bold text-[var(--secondary)]">{revenue}</p>
                </div>
                <div className="neu-pressed-base border-transparent shadow-inner p-5 flex flex-col gap-1 rounded-2xl items-center text-center">
                    <Calendar className="text-[var(--accent)] mb-1" size={16} />
                    <p className="text-[10px] text-[var(--secondary)]/60 uppercase font-bold tracking-wider">Runway</p>
                    <p className="text-base font-bold text-[var(--secondary)]">{pitchDeck.runway_months ? `${pitchDeck.runway_months} Mo` : "N/A"}</p>
                </div>
            </div>

            {/* The Business Case */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Lightbulb size={16} className="text-[var(--accent)]" /> Problem Statement
                    </h2>
                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed font-medium whitespace-pre-line">
                        {pitchDeck.problem_statement || "Not detailed."}
                    </p>
                </div>

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <CheckCircle2 size={16} className="text-emerald-600" /> The Solution
                    </h2>
                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed font-medium whitespace-pre-line">
                        {pitchDeck.solution || "Not detailed."}
                    </p>
                </div>

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Globe size={16} className="text-[var(--accent)]" /> Market Size
                    </h2>
                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed font-medium whitespace-pre-line">
                        {pitchDeck.market_size || "Not detailed."}
                    </p>
                </div>

                <div className="neu-flat-base p-6 space-y-4">
                    <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                        <Briefcase size={16} className="text-[var(--accent)]" /> Business Model
                    </h2>
                    <p className="text-sm text-[var(--secondary)]/80 leading-relaxed font-medium whitespace-pre-line">
                        {pitchDeck.business_model || "Not detailed."}
                    </p>
                </div>
            </div>

            {/* External Document Attachment */}
            {pitchDeck.deck_url && (
                <div className="neu-flat-base p-6 relative flex flex-col items-center justify-center space-y-4">
                    <div className="p-3 rounded-full neu-pressed-base border-transparent shadow-inner text-[var(--accent)]">
                        <Presentation size={24} />
                    </div>
                    <a
                        href={pitchDeck.deck_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 neu-btn text-xs font-bold"
                    >
                        View External Deck Document
                    </a>
                </div>
            )}

            {/* Embedded Action System (Only shows if viewer is an Investor) */}
            {user && !isOwner && (
                <EmbeddedInvestorActions
                    pitchId={pitchDeck.id}
                    startupId={pitchDeck.user_id}
                    currentUserId={user.id}
                />
            )}
        </div>
    );
}