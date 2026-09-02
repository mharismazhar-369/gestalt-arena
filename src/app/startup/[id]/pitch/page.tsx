import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PitchActionBar from "@/components/pitch/PitchActionBar";
import { Eye, Star, Target, TrendingUp, Users, Wallet, Presentation } from "lucide-react";

export default async function PitchDeckView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: pitchDeck, error } = await supabase
        .from("pitch_decks")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !pitchDeck) {
        return (
            <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <h1 className="text-2xl font-bold text-slate-300">Pitch Deck Not Found</h1>
                        <p className="text-slate-500">This deck may have been removed or set to private.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Dynamic formatting for financials to prevent hardcoded artifacts
    const fundingGoal = pitchDeck.funding_goal ? `$${pitchDeck.funding_goal.toLocaleString()}` : "Flexible";
    const minTicket = pitchDeck.min_ticket ? `$${pitchDeck.min_ticket.toLocaleString()}` : "Flexible";
    const valuation = pitchDeck.valuation ? `$${pitchDeck.valuation.toLocaleString()}` : "TBD";

    // Fallbacks for analytics if the database columns are empty
    const totalViews = pitchDeck.views_count || 0;
    const avgRating = pitchDeck.average_rating || 0;

    return (
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />

            <main className="pt-32 pb-40 px-6 mx-auto max-w-6xl w-full relative z-10 space-y-8">
                <div className="trionn-glass-card rounded-3xl border border-violet-500/30 p-8 md:p-10 relative overflow-hidden shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="space-y-4 max-w-2xl">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300">
                                {pitchDeck.stage || "Seed"} Round
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-white">
                                {pitchDeck.title || "Untitled Pitch"}
                            </h1>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                {pitchDeck.elevator_pitch || pitchDeck.description || "No elevator pitch provided."}
                            </p>
                        </div>

                        <div className="flex gap-6 border border-white/10 bg-white/5 p-4 rounded-2xl backdrop-blur-md">
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <div className="flex items-center gap-1.5 text-cyan-400">
                                    <Eye size={20} />
                                    <span className="text-xl font-bold">{totalViews}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Views</span>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <div className="flex items-center gap-1.5 text-amber-400">
                                    <Star size={20} fill="currentColor" />
                                    <span className="text-xl font-bold">{avgRating}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Ratings</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="trionn-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
                        <Target className="text-cyan-400 mb-2" size={24} />
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Raise Target</p>
                        <p className="text-xl font-bold text-white">{fundingGoal}</p>
                    </div>
                    <div className="trionn-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
                        <Wallet className="text-emerald-400 mb-2" size={24} />
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Min Ticket</p>
                        <p className="text-xl font-bold text-white">{minTicket}</p>
                    </div>
                    <div className="trionn-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
                        <TrendingUp className="text-pink-400 mb-2" size={24} />
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Valuation</p>
                        <p className="text-xl font-bold text-white">{valuation}</p>
                    </div>
                    <div className="trionn-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
                        <Users className="text-orange-400 mb-2" size={24} />
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Traction</p>
                        <p className="text-xl font-bold text-white">{pitchDeck.traction || "Early Stage"}</p>
                    </div>
                </div>

                <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 aspect-video relative flex flex-col items-center justify-center bg-black/50 space-y-4 shadow-xl">
                    {pitchDeck.deck_url ? (
                        <>
                            <Presentation size={48} className="text-violet-400" />
                            <a
                                href={pitchDeck.deck_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30 transition font-bold text-sm"
                            >
                                View External Deck Document
                            </a>
                        </>
                    ) : (
                        <p className="text-slate-500 font-mono">No external deck document attached.</p>
                    )}
                </div>
            </main>

            {user.id !== pitchDeck.user_id && (
                <PitchActionBar
                    pitchId={pitchDeck.id}
                    startupId={pitchDeck.user_id}
                    currentUserId={user.id}
                />
            )}
            <Footer />
        </div>
    );
}