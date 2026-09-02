export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Target, DollarSign, Activity, FileText, Eye, Building, Rocket, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import PitchDeckViewer from "@/components/pitch/PitchDeckViewer";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";
import { Suspense } from "react";

export default async function BidDetailsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id: bidId } = await params;

    // The await is strictly required here for Next.js App Router SSR
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch the specific Bid Deck
    const { data: bid } = await supabase
        .from("investor_bid_decks")
        .select("*")
        .eq("id", bidId)
        .single();

    if (!bid) redirect("/browse/bids");

    const isOwner = user?.id === bid.investor_id;

    // 2. Check if current viewing user is a founder
    let isFounder = false;
    if (user && !isOwner) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        isFounder = profile?.role === "startup";
    }

    // 3. Contextual Data Fetching for Deal Negotiations
    let deals: any[] = [];

    if (user) {
        if (isOwner) {
            // Investors see ALL pitches submitted to their mandate
            const { data: negotiations } = await supabase
                .from("deal_negotiations")
                .select(`
                    id, status, created_at, pitch_deck_id,
                    pitch_decks ( title, stage, funding_goal )
                `)
                .eq("bid_deck_id", bidId)
                .order("created_at", { ascending: false });
            deals = negotiations || [];
        } else if (isFounder) {
            // Founders see ONLY their own pitches submitted to this mandate
            const { data: myNegotiation } = await supabase
                .from("deal_negotiations")
                .select(`
                    id, status, created_at, pitch_deck_id,
                    pitch_decks ( title, stage, funding_goal )
                `)
                .eq("bid_deck_id", bidId)
                .eq("startup_id", user.id)
                .order("created_at", { ascending: false });
            deals = myNegotiation || [];
        }
    }

    const hasApplied = isFounder && deals.length > 0;

    return (
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-5xl w-full relative z-10 space-y-8">

                {/* Mandate Header */}
                <div className="trionn-glass-card rounded-3xl border border-cyan-500/30 p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-cyan-500/5 pointer-events-none">
                        <Target size={180} />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {bid.status}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-white">{bid.title}</h1>
                        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">{bid.thesis}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10 border-t border-white/10 pt-6">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><DollarSign size={12} /> Max Allocation</span>
                            <span className="text-lg font-black text-cyan-400">${bid.max_allocation?.toLocaleString() || "Flexible"}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><Activity size={12} /> Min ARR</span>
                            <span className="text-lg font-black text-emerald-400">${bid.min_arr?.toLocaleString() || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Founder View: Apply CTA (If haven't applied yet) */}
                {isFounder && !hasApplied && (
                    <div className="trionn-glass-card rounded-3xl border border-violet-500/30 p-8 text-center space-y-4 bg-violet-500/5 shadow-xl">
                        <h3 className="text-xl font-bold text-white">Apply for this Mandate</h3>
                        <p className="text-xs text-slate-400 max-w-lg mx-auto">Submit your pitch deck directly to this investor's pipeline to open a private deal negotiation thread.</p>
                        <Link
                            href={`/startup/pitch/build?target_bid=${bid.id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-violet-600 transition"
                        >
                            <FileText size={16} /> Submit Custom Pitch Deck
                        </Link>
                    </div>
                )}

                {/* Founder View: Active Deal Thread (If already applied) */}
                {isFounder && hasApplied && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                            <Rocket size={20} className="text-violet-400" /> Your Active Application
                        </h2>

                        <div className="space-y-4">
                            {deals.map((deal) => (
                                <details key={deal.id} className="group bg-black/40 rounded-2xl border border-violet-500/30 overflow-hidden transition-all duration-300 shadow-lg">
                                    <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-white/5 transition-colors [&::-webkit-details-marker]:hidden">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded border border-violet-500/30">Status: {deal.status}</span>
                                                <span className="text-[10px] text-slate-500">Submitted: {new Date(deal.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                {deal.pitch_decks?.title || "Untitled Pitch"}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/30 px-4 py-2 rounded-xl group-open:hidden flex items-center gap-1">
                                                <Eye size={14} /> Review Submission
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 bg-white/10 border border-white/10 px-4 py-2 rounded-xl hidden group-open:block">
                                                Close Viewer
                                            </span>
                                        </div>
                                    </summary>

                                    <div className="p-6 border-t border-violet-500/30 bg-[#02040a]">
                                        <Suspense fallback={<div className="text-sm text-violet-400 p-8 text-center animate-pulse">Loading Pitch Deck...</div>}>
                                            <PitchDeckViewer pitchId={deal.pitch_deck_id} />
                                        </Suspense>

                                        {/* Action Bar for Founder */}
                                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-violet-500/30 pt-6">
                                            <span className="text-xs text-slate-400">Application Status: <strong className="text-amber-400">{deal.status}</strong></span>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <DeleteResourceButton table="deal_negotiations" recordId={deal.id} itemName="Application" />
                                                <Link
                                                    href={`/negotiations/${deal.id}`}
                                                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-violet-500 hover:bg-violet-600 hover:scale-105 rounded-xl transition shadow-lg shadow-violet-500/20"
                                                >
                                                    <MessageSquare size={14} /> Enter Negotiation Room
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                )}

                {/* Investor View: Private Deal Pipeline */}
                {isOwner && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                            <Building size={20} className="text-cyan-400" /> Received Pitches & Deal Threads
                        </h2>

                        {deals.length === 0 ? (
                            <div className="p-10 border border-dashed border-white/10 bg-white/5 rounded-3xl text-center space-y-2">
                                <p className="text-sm font-bold text-slate-300">No pitches received yet.</p>
                                <p className="text-xs text-slate-500">Founders applying to this mandate will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {deals.map((deal) => (
                                    <details key={deal.id} className="group bg-black/40 rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 shadow-lg">
                                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-white/5 transition-colors [&::-webkit-details-marker]:hidden">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{deal.status}</span>
                                                    <span className="text-[10px] text-slate-500">{new Date(deal.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    {deal.pitch_decks?.title || "Untitled Pitch"}
                                                </h3>
                                                <p className="text-xs text-cyan-400 font-mono mt-1">Requesting: ${deal.pitch_decks?.funding_goal?.toLocaleString()}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl group-open:hidden flex items-center gap-1">
                                                    <Eye size={14} /> View Deck
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 bg-white/10 border border-white/10 px-4 py-2 rounded-xl hidden group-open:block">
                                                    Close Viewer
                                                </span>
                                            </div>
                                        </summary>

                                        <div className="p-6 border-t border-white/10 bg-[#02040a]">
                                            <Suspense fallback={<div className="text-sm text-cyan-400 p-8 text-center animate-pulse">Loading Pitch Deck...</div>}>
                                                <PitchDeckViewer pitchId={deal.pitch_deck_id} />
                                            </Suspense>

                                            {/* Action Bar for Investor */}
                                            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-6">
                                                <span className="text-xs text-slate-400">Current Status: <strong className="text-amber-400">{deal.status}</strong></span>
                                                <div className="flex gap-3">
                                                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition">
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                    <Link
                                                        href={`/negotiations/${deal.id}`}
                                                        className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-black bg-cyan-500 hover:bg-cyan-400 hover:scale-105 rounded-xl transition shadow-lg shadow-cyan-500/20"
                                                    >
                                                        <CheckCircle2 size={14} /> Accept & Negotiate
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
}