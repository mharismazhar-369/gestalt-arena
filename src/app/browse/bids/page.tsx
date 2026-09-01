import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import Link from "next/link";
import { Target, DollarSign, Briefcase, Building2, ChevronRight } from "lucide-react";

export default async function BrowseBidsPage() {
    const supabase = await createClient();

    // Fetch active bid decks and join with the investor's profile data
    const { data: bids } = await supabase
        .from("investor_bid_decks")
        .select(`
      *,
      profiles:investor_id (nickname, company_name, tier, city, country)
    `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10">

                {/* Header Section */}
                <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            <Target size={24} />
                        </span>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                                Reverse Pitching
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black text-white">Active Capital Mandates</h1>
                        </div>
                        <BetaBadge variant="pill" className="ml-auto hidden sm:inline-flex" />
                    </div>
                    <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                        Investors are actively deploying capital. Review their strict criteria, target sectors, and minimum ARR requirements, then submit your pitch deck directly to their pipeline.
                    </p>
                </div>

                {/* Mandates Grid */}
                {bids && bids.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bids.map((bid) => {
                            // Handle Supabase join array/object typing
                            const profile = Array.isArray(bid.profiles) ? bid.profiles[0] : bid.profiles;
                            const investorName = profile?.company_name || profile?.nickname || "Undisclosed Fund";

                            return (
                                <div key={bid.id} className="trionn-glass-card rounded-3xl border border-white/10 p-6 flex flex-col h-full shadow-xl hover:border-cyan-400/50 transition group">
                                    <div className="flex-grow space-y-4">
                                        <div className="flex justify-between items-start">
                                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                Accepting Pitches
                                            </span>
                                            {profile?.tier && (
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-white/10 px-2 py-0.5 rounded-md">
                                                    {profile.tier}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                                                {bid.title}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-bold">
                                                <Building2 size={12} className="text-cyan-400" /> {investorName}
                                            </p>
                                        </div>

                                        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                                            {bid.thesis}
                                        </p>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {bid.target_sectors?.slice(0, 3).map((sector: string, i: number) => (
                                                <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 whitespace-nowrap">
                                                    {sector}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Financial Parameters & Action */}
                                    <div className="border-t border-white/10 pt-4 mt-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                                                    <DollarSign size={10} className="text-emerald-400" /> Max Alloc
                                                </span>
                                                <p className="text-sm font-black text-white">${bid.max_allocation?.toLocaleString()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                                                    <Briefcase size={10} className="text-violet-400" /> Min ARR
                                                </span>
                                                <p className="text-sm font-black text-white">${bid.min_arr?.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/bids/${bid.id}`}
                                            className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-500/10 border border-cyan-400/40 px-4 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-400 hover:text-black transition shadow-lg shadow-cyan-500/10"
                                        >
                                            View Details & Pitch <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="trionn-glass-card rounded-3xl border border-white/10 p-12 text-center space-y-4">
                        <Target size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400 text-sm font-bold">No active mandates currently available.</p>
                        <p className="text-slate-500 text-xs">Investors will publish their capital requirements here shortly.</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}