export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Target, FileText, DollarSign, Activity, CheckCircle, SlidersHorizontal } from "lucide-react";

export default async function UnifiedBoardPage({
    searchParams
}: {
    searchParams?: { filter?: string }
}) {
    const supabase = await createClient();

    // 1. Fetch ONLY Public, Active Investor Mandates (Filters out Private counter-offers)
    const { data: mandates } = await supabase
        .from("investor_bid_decks")
        .select("*, profiles!investor_bid_decks_investor_id_fkey(company_name, nickname)")
        .eq("status", "active") // CRITICAL FIX: Hides Private bids
        .order("created_at", { ascending: false });

    // 2. Fetch ONLY Public Startup Pitches (Filters out pitches tailored to specific mandates)
    const { data: pitches } = await supabase
        .from("pitch_decks")
        .select("*, profiles!pitch_decks_user_id_fkey(company_name, nickname)")
        .is("target_bid_id", null) // CRITICAL FIX: Hides locked/tailored pitches
        .order("created_at", { ascending: false });

    // 3. Format & Merge into a single feed
    const formattedMandates = (mandates || []).map(m => ({ ...m, feed_type: 'mandate' }));
    const formattedPitches = (pitches || []).map(p => ({ ...p, feed_type: 'pitch' }));

    const unifiedFeed = [...formattedMandates, ...formattedPitches].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // 4. Server-Side Filtering based on URL Query Params
    const filter = searchParams?.filter || 'all';
    const filteredFeed = unifiedFeed.filter(item => {
        if (filter === 'investors') return item.feed_type === 'mandate';
        if (filter === 'startups') return item.feed_type === 'pitch';
        return true;
    });

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />
            <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-8">

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-2xl neu-pressed-base border-transparent text-[var(--accent)] shadow-inner">
                            <Activity size={24} />
                        </span>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                                Live Deal Flow
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)]">Arena Public Ledger</h1>
                        </div>
                    </div>
                    <p className="text-[var(--secondary)]/70 font-medium">Live feed of Investor Capital Mandates and Startup Pitches.</p>
                </div>

                {/* Filter Criteria UI */}
                <div className="neu-flat-base p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 text-[var(--secondary)]/70 text-sm font-bold w-full sm:w-auto px-2">
                        <SlidersHorizontal size={16} className="text-[var(--accent)]" />
                        <span>Filter Feed:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Link
                            href="?filter=all"
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${filter === 'all' ? 'neu-pressed-base text-[var(--accent)] shadow-inner' : 'neu-btn'}`}
                        >
                            All Deals
                        </Link>
                        <Link
                            href="?filter=investors"
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${filter === 'investors' ? 'neu-pressed-base text-[var(--accent)] shadow-inner' : 'neu-btn'}`}
                        >
                            <Target size={14} /> Investor Mandates
                        </Link>
                        <Link
                            href="?filter=startups"
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${filter === 'startups' ? 'neu-pressed-base text-[var(--accent)] shadow-inner' : 'neu-btn'}`}
                        >
                            <FileText size={14} /> Startup Pitches
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFeed.map((item) => (
                        item.feed_type === 'mandate' ? (
                            // INVESTOR MANDATE CARD
                            <div key={`m-${item.id}`} className="neu-flat-base p-6 space-y-4 flex flex-col relative overflow-hidden">
                                {item.status === 'Closed' && (
                                    <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)] bg-[var(--primary)] border border-[var(--secondary)]/10 px-2 py-1 rounded shadow-inner">
                                        Deal Closed
                                    </div>
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1">
                                    <Target size={12} /> Capital Mandate
                                </span>
                                <h3 className="text-xl font-bold text-[var(--secondary)] line-clamp-1">{item.title}</h3>
                                <p className="text-xs text-[var(--secondary)]/70 line-clamp-2 flex-grow font-medium">{item.thesis}</p>

                                <div className="grid grid-cols-2 gap-2 py-4 border-y border-[var(--secondary)]/10 my-2">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-[var(--secondary)]/50 block">Max Alloc</span>
                                        <span className="text-sm font-black text-[var(--secondary)]">${item.max_allocation?.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-[var(--secondary)]/50 block">Min ARR</span>
                                        <span className="text-sm font-black text-[var(--secondary)]">${item.min_arr?.toLocaleString()}</span>
                                    </div>
                                </div>
                                <Link href={`/bids/${item.id}`} className="w-full text-center py-3 neu-btn text-xs">
                                    View Mandate Details
                                </Link>
                            </div>
                        ) : (
                            // STARTUP PITCH CARD
                            <div key={`p-${item.id}`} className="neu-flat-base p-6 space-y-4 flex flex-col relative overflow-hidden">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)]/70 flex items-center gap-1">
                                    <FileText size={12} className="text-[var(--accent)]" /> Startup Pitch
                                </span>
                                <h3 className="text-xl font-bold text-[var(--secondary)] line-clamp-1">{item.title}</h3>
                                <p className="text-xs text-[var(--secondary)]/70 line-clamp-2 flex-grow font-medium">{item.elevator_pitch}</p>

                                <div className="grid grid-cols-2 gap-2 py-4 border-y border-[var(--secondary)]/10 my-2">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-[var(--secondary)]/50 block">Target Raise</span>
                                        <span className="text-sm font-black text-[var(--secondary)]">${Number(item.funding_goal)?.toLocaleString() || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-[var(--secondary)]/50 block">Stage</span>
                                        <span className="text-sm font-black text-[var(--secondary)]">{item.stage || "Pre-Seed"}</span>
                                    </div>
                                </div>
                                <Link href={`/startup/${item.id}/pitch`} className="w-full text-center py-3 neu-btn text-xs">
                                    View Pitch Deck
                                </Link>
                            </div>
                        )
                    ))}

                    {/* Empty State / No Results */}
                    {filteredFeed.length === 0 && (
                        <div className="col-span-full neu-flat-base p-12 text-center space-y-4">
                            <p className="text-[var(--secondary)]/60 text-sm font-medium">No deals match this filter setting right now.</p>
                            <Link href="?filter=all" className="neu-btn px-5 py-2 text-xs inline-flex">
                                View All Deals
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}