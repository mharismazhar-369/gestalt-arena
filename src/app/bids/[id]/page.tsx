export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Target, DollarSign, Activity, FileText, Eye, Building, Rocket, CheckCircle2, XCircle, MessageSquare, Globe, Briefcase, Clock, Percent, Link as LinkIcon } from "lucide-react";
import PitchDeckViewer from "@/components/pitch/PitchDeckViewer";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";
import { Suspense } from "react";

export default async function BidDetailsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id: bidId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch strictly the targeted Mandate
    const { data: bid } = await supabase
        .from("investor_bid_decks")
        .select("*")
        .eq("id", bidId)
        .single();

    if (!bid) redirect("/browse/bids");

    const isOwner = user?.id === bid.investor_id;

    let isFounder = false;
    if (user && !isOwner) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        isFounder = profile?.role === "startup";
    }

    let deals: any[] = [];
    if (user) {
        if (isOwner) {
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
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-6xl w-full relative z-10 space-y-8">

                {/* Mandate Master Card */}
                <div className="neu-flat-base p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-[var(--secondary)] opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
                        <Target size={240} />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase text-[var(--accent)] inline-block mb-2">
                            {bid.status || "Active Mandate"}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)] leading-tight">{bid.title}</h1>
                        <p className="text-[var(--secondary)]/80 text-sm leading-relaxed max-w-4xl font-medium">{bid.thesis}</p>
                    </div>

                    {/* New: Advanced Mandate Parameters Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-10 relative z-10">
                        <div className="neu-pressed-base border-transparent shadow-inner p-4 flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 flex items-center gap-1.5"><DollarSign size={12} className="text-[var(--accent)]" /> Max Allocation</span>
                            <span className="text-lg font-black text-emerald-600">${bid.max_allocation?.toLocaleString() || "Flexible"}</span>
                        </div>
                        <div className="neu-pressed-base border-transparent shadow-inner p-4 flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 flex items-center gap-1.5"><Activity size={12} className="text-[var(--accent)]" /> Min ARR Target</span>
                            <span className="text-lg font-black text-[var(--secondary)]">${bid.min_arr?.toLocaleString() || 0}</span>
                        </div>
                        <div className="neu-pressed-base border-transparent shadow-inner p-4 flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 flex items-center gap-1.5"><Percent size={12} className="text-[var(--accent)]" /> Min ROI Rate</span>
                            <span className="text-lg font-black text-[var(--secondary)]">{bid.min_roi ? `${bid.min_roi}%` : "TBD"}</span>
                        </div>
                        <div className="neu-pressed-base border-transparent shadow-inner p-4 flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 flex items-center gap-1.5"><Briefcase size={12} className="text-[var(--accent)]" /> Inv. Type</span>
                            <span className="text-sm font-black text-[var(--secondary)] capitalize mt-1">{bid.investment_type || "Equity"}</span>
                        </div>
                        <div className="neu-pressed-base border-transparent shadow-inner p-4 flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 flex items-center gap-1.5"><Clock size={12} className="text-[var(--accent)]" /> Duration</span>
                            <span className="text-sm font-black text-[var(--secondary)] mt-1">{bid.investment_duration || "Long-term"}</span>
                        </div>
                    </div>

                    {/* New: Lists Section (Sectors, Countries, Portfolios) */}
                    <div className="grid md:grid-cols-3 gap-6 mt-6 relative z-10">
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-[var(--secondary)]/70 flex items-center gap-2"><Target size={14} className="text-[var(--accent)]" /> Target Sectors</h4>
                            <div className="flex flex-wrap gap-2">
                                {bid.target_sectors && bid.target_sectors.length > 0 ? bid.target_sectors.map((sector: string) => (
                                    <span key={sector} className="px-2.5 py-1 text-[10px] font-bold text-[var(--secondary)] neu-pressed-base border-transparent shadow-inner">{sector}</span>
                                )) : <span className="text-xs text-[var(--secondary)]/50 font-medium">Sector Agnostic</span>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-[var(--secondary)]/70 flex items-center gap-2"><Globe size={14} className="text-[var(--accent)]" /> Target Countries</h4>
                            <div className="flex flex-wrap gap-2">
                                {bid.target_countries && bid.target_countries.length > 0 ? bid.target_countries.map((country: string) => (
                                    <span key={country} className="px-2.5 py-1 text-[10px] font-bold text-[var(--secondary)] neu-pressed-base border-transparent shadow-inner">{country}</span>
                                )) : <span className="text-xs text-[var(--secondary)]/50 font-medium">Global Scope</span>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-[var(--secondary)]/70 flex items-center gap-2"><LinkIcon size={14} className="text-[var(--accent)]" /> Previous Portfolios</h4>
                            <div className="space-y-2">
                                {bid.previous_portfolios && bid.previous_portfolios.length > 0 ? bid.previous_portfolios.map((link: string, idx: number) => (
                                    <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="block w-full px-3 py-2 text-[10px] font-bold text-[var(--accent)] neu-pressed-base border-transparent shadow-inner hover:underline truncate">
                                        {link}
                                    </a>
                                )) : <span className="text-xs text-[var(--secondary)]/50 font-medium">No previous portfolios linked.</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Founder Specific Action */}
                {isFounder && !hasApplied && (
                    <div className="neu-flat-base p-10 text-center space-y-4">
                        <h3 className="text-xl font-bold text-[var(--secondary)]">Apply for this Mandate</h3>
                        <p className="text-xs text-[var(--secondary)]/70 max-w-lg mx-auto font-medium">Submit your pitch deck directly to this investor's pipeline to open a private deal negotiation thread.</p>
                        <Link
                            href={`/bids/${bid.id}/apply`}
                            className="inline-flex items-center gap-2 px-8 py-3 text-sm neu-btn mt-2"
                        >
                            <FileText size={16} /> Submit Custom Pitch Deck
                        </Link>
                    </div>
                )}

                {/* Founder View Active Applications */}
                {isFounder && hasApplied && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-2">
                            <Rocket size={20} className="text-[var(--accent)]" /> Your Active Application
                        </h2>
                        <div className="space-y-4">
                            {deals.map((deal) => (
                                <details key={deal.id} className="group neu-flat-base overflow-hidden transition-all duration-300">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-[var(--secondary)]/5 transition-colors [&::-webkit-details-marker]:hidden">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-bold text-[var(--accent)] neu-pressed-base border-transparent shadow-inner px-2 py-0.5 rounded">Status: {deal.status}</span>
                                                <span className="text-[10px] text-[var(--secondary)]/50 font-bold">Submitted: {new Date(deal.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                                                {deal.pitch_decks?.title || "Untitled Pitch"}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[var(--accent)] neu-btn px-4 py-2 group-open:hidden flex items-center gap-1">
                                                <Eye size={14} /> Review Submission
                                            </span>
                                            <span className="text-xs font-bold text-[var(--secondary)]/70 neu-pressed-base border-transparent shadow-inner px-4 py-2 hidden group-open:block">
                                                Close Viewer
                                            </span>
                                        </div>
                                    </summary>
                                    <div className="p-6 border-t border-[var(--secondary)]/10 bg-[var(--primary)]">
                                        <Suspense fallback={<div className="text-sm text-[var(--accent)] p-8 text-center animate-pulse font-bold">Loading Pitch Deck...</div>}>
                                            <PitchDeckViewer pitchId={deal.pitch_deck_id} />
                                        </Suspense>
                                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--secondary)]/10 pt-6">
                                            <span className="text-xs text-[var(--secondary)]/60 font-bold">Application Status: <strong className="text-[var(--secondary)]">{deal.status}</strong></span>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <DeleteResourceButton table="deal_negotiations" recordId={deal.id} itemName="Application" />
                                                <Link
                                                    href={`/negotiations/${deal.id}`}
                                                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs neu-btn"
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

                {/* Investor Owner View Applications */}
                {isOwner && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-2">
                            <Building size={20} className="text-[var(--accent)]" /> Received Pitches & Deal Threads
                        </h2>
                        {deals.length === 0 ? (
                            <div className="p-10 border border-dashed border-[var(--secondary)]/20 bg-transparent rounded-3xl text-center space-y-2">
                                <p className="text-sm font-bold text-[var(--secondary)]/70">No pitches received yet.</p>
                                <p className="text-xs text-[var(--secondary)]/50 font-medium">Founders applying to this mandate will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {deals.map((deal) => (
                                    <details key={deal.id} className="group neu-flat-base overflow-hidden transition-all duration-300">
                                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-[var(--secondary)]/5 transition-colors [&::-webkit-details-marker]:hidden">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[10px] font-bold text-amber-600 neu-pressed-base border-transparent shadow-inner px-2 py-0.5 rounded">{deal.status}</span>
                                                    <span className="text-[10px] text-[var(--secondary)]/50 font-bold">{new Date(deal.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                                                    {deal.pitch_decks?.title || "Untitled Pitch"}
                                                </h3>
                                                <p className="text-xs text-emerald-600 font-mono font-bold mt-1">Requesting: ${deal.pitch_decks?.funding_goal?.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-[var(--accent)] neu-btn px-4 py-2 group-open:hidden flex items-center gap-1">
                                                    <Eye size={14} /> View Deck
                                                </span>
                                                <span className="text-xs font-bold text-[var(--secondary)]/70 neu-pressed-base border-transparent shadow-inner px-4 py-2 hidden group-open:block">
                                                    Close Viewer
                                                </span>
                                            </div>
                                        </summary>
                                        <div className="p-6 border-t border-[var(--secondary)]/10 bg-[var(--primary)]">
                                            <Suspense fallback={<div className="text-sm text-[var(--accent)] p-8 text-center animate-pulse font-bold">Loading Pitch Deck...</div>}>
                                                <PitchDeckViewer pitchId={deal.pitch_deck_id} />
                                            </Suspense>
                                            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--secondary)]/10 pt-6">
                                                <span className="text-xs text-[var(--secondary)]/60 font-bold">Current Status: <strong className="text-[var(--secondary)]">{deal.status}</strong></span>
                                                <div className="flex gap-3">
                                                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-rose-600 bg-transparent hover:bg-rose-600/10 border border-rose-600/30 rounded-xl transition">
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                    <Link href={`/negotiations/${deal.id}`} className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs neu-btn">
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