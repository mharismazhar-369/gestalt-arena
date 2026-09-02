export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Target, FileText, DollarSign, Activity, CheckCircle } from "lucide-react";

export default async function UnifiedBoardPage() {
    const supabase = await createClient();

    // 1. Fetch ALL Investor Mandates (Active & Closed)
    const { data: mandates } = await supabase
        .from("investor_bid_decks")
        .select("*, profiles!investor_bid_decks_investor_id_fkey(company_name, nickname)")
        .order("created_at", { ascending: false });

    // 2. Fetch ALL Startup Pitches (Public & Targeted)
    const { data: pitches } = await supabase
        .from("pitch_decks")
        .select("*, profiles!pitch_decks_user_id_fkey(company_name, nickname)")
        .order("created_at", { ascending: false });

    // 3. Format & Merge into a single feed
    const formattedMandates = (mandates || []).map(m => ({ ...m, feed_type: 'mandate' }));
    const formattedPitches = (pitches || []).map(p => ({ ...p, feed_type: 'pitch' }));

    const unifiedFeed = [...formattedMandates, ...formattedPitches].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />
            <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-8">

                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3">
                        <Target className="text-cyan-400" size={40} /> Arena Public Ledger
                    </h1>
                    <p className="text-slate-400">Live feed of Investor Capital Mandates and Startup Pitches.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unifiedFeed.map((item) => (
                        item.feed_type === 'mandate' ? (
                            // INVESTOR MANDATE CARD
                            <div key={`m-${item.id}`} className="trionn-glass-card rounded-3xl border border-cyan-500/30 p-6 space-y-4 shadow-xl flex flex-col relative overflow-hidden">
                                {item.status === 'Closed' && (
                                    <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded">
                                        Deal Closed
                                    </div>
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                                    <Target size={12} /> Capital Mandate
                                </span>
                                <h3 className="text-xl font-bold text-white line-clamp-1">{item.title}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2 flex-grow">{item.thesis}</p>

                                <div className="grid grid-cols-2 gap-2 py-4 border-y border-white/10 my-2">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Max Alloc</span>
                                        <span className="text-sm font-black text-cyan-400">${item.max_allocation?.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Min ARR</span>
                                        <span className="text-sm font-black text-emerald-400">${item.min_arr?.toLocaleString()}</span>
                                    </div>
                                </div>
                                <Link href={`/bids/${item.id}`} className="w-full text-center py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition">
                                    View Mandate Details
                                </Link>
                            </div>
                        ) : (
                            // STARTUP PITCH CARD
                            <div key={`p-${item.id}`} className="trionn-glass-card rounded-3xl border border-violet-500/30 p-6 space-y-4 shadow-xl flex flex-col relative overflow-hidden">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1">
                                    <FileText size={12} /> Startup Pitch
                                </span>
                                <h3 className="text-xl font-bold text-white line-clamp-1">{item.title}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2 flex-grow">{item.elevator_pitch}</p>

                                <div className="grid grid-cols-2 gap-2 py-4 border-y border-white/10 my-2">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Target Raise</span>
                                        <span className="text-sm font-black text-emerald-400">${Number(item.funding_goal)?.toLocaleString() || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Stage</span>
                                        <span className="text-sm font-black text-violet-400">{item.stage || "Pre-Seed"}</span>
                                    </div>
                                </div>
                                <Link href={`/startup/${item.id}/pitch`} className="w-full text-center py-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold transition">
                                    View Pitch Deck
                                </Link>
                            </div>
                        )
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}