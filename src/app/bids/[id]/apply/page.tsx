import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
    Target, ArrowLeft, FileText, PlusCircle, CheckCircle2,
    Trophy, DollarSign, Activity, Percent, Briefcase, Clock,
    Globe, Link as LinkIcon
} from "lucide-react";
import MandateApplicationForm from "@/components/bids/MandateApplicationForm";

export default async function ApplyToMandatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 1. Fetch the Target Mandate (Bid Deck)
    const { data: bid, error: bidError } = await supabase
        .from("investor_bid_decks")
        .select(`*, profiles:investor_id (company_name, nickname)`)
        .eq("id", id)
        .single();

    if (bidError || !bid) {
        redirect("/browse/bids");
    }

    const profile = Array.isArray(bid.profiles) ? bid.profiles[0] : bid.profiles;
    const investorName = profile?.company_name || profile?.nickname || "Undisclosed Investor";

    // --- ENHANCED: Route Protection for Closed/Successful Deals ---
    if (bid.status === "Accepted" || bid.status === "Closed") {
        return (
            <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
                <Navbar />
                <main className="flex-grow flex items-center justify-center p-6 relative z-10">
                    <div className="neu-flat-base p-10 max-w-lg w-full text-center space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Trophy size={150} />
                        </div>
                        <div className="relative z-10">
                            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
                                <Trophy size={32} />
                            </div>
                            <h1 className="text-2xl font-black text-[var(--secondary)] mb-2">Deal Successfully Closed</h1>
                            <p className="text-sm font-medium text-[var(--secondary)]/70">
                                The mandate <strong>"{bid.title}"</strong> by <strong>{investorName}</strong> has been successfully allocated and matched on the platform! It is no longer accepting new applications.
                            </p>
                            <Link href="/browse/bids" className="neu-btn px-8 py-3 inline-block mt-6 text-sm">
                                Browse Active Mandates
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // 2. Fetch the Founder's Existing Pitch Decks
    const { data: existingPitches } = await supabase
        .from("pitch_decks")
        .select("id, title, stage, funding_goal, target_bid_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-5xl w-full relative z-10 space-y-8">
                <Link href={`/bids/${bid.id}`} className="inline-flex items-center text-sm font-bold text-[var(--secondary)]/60 hover:text-[var(--accent)] transition">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Mandate Details
                </Link>

                {/* Enhanced Mandate Summary Card */}
                <div className="neu-flat-base p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 text-[var(--secondary)] opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
                        <Target size={180} />
                    </div>

                    <div className="relative z-10 space-y-2 mb-8">
                        <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-[var(--accent)] inline-block mb-2">
                            Applying To Mandate
                        </span>
                        <h1 className="text-3xl font-black text-[var(--secondary)]">{bid.title}</h1>
                        <p className="text-sm font-bold text-[var(--secondary)]/70 flex items-center gap-2">
                            <span className="text-[var(--accent)]">Capital Allocator:</span> {investorName}
                        </p>
                    </div>

                    {/* Integrated Advanced Parameters */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10 mb-6">
                        <div className="neu-pressed-base border-transparent shadow-inner p-3 flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-bold text-[var(--secondary)]/60 flex items-center gap-1.5"><DollarSign size={10} className="text-[var(--accent)]" /> Max Allocation</span>
                            <span className="text-sm font-black text-emerald-600">${bid.max_allocation?.toLocaleString() || "Flexible"}</span>
                        </div>
                        <div className="neu-pressed-base border-transparent shadow-inner p-3 flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-bold text-[var(--secondary)]/60 flex items-center gap-1.5"><Activity size={10} className="text-[var(--accent)]" /> Min ARR</span>
                            <span className="text-sm font-black text-[var(--secondary)]">${bid.min_arr?.toLocaleString() || 0}</span>
                        </div>
                        <div className="neu-pressed-base border-transparent shadow-inner p-3 flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-bold text-[var(--secondary)]/60 flex items-center gap-1.5"><Percent size={10} className="text-[var(--accent)]" /> Min ROI</span>
                            <span className="text-sm font-black text-[var(--secondary)]">{bid.min_roi ? `${bid.min_roi}%` : "TBD"}</span>
                        </div>
                        <div className="neu-pressed-base border-transparent shadow-inner p-3 flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-bold text-[var(--secondary)]/60 flex items-center gap-1.5"><Briefcase size={10} className="text-[var(--accent)]" /> Inv. Type</span>
                            <span className="text-[11px] font-black text-[var(--secondary)] capitalize mt-1 truncate">{bid.investment_type || "Equity"}</span>
                        </div>
                        <div className="neu-pressed-base border-transparent shadow-inner p-3 flex flex-col gap-1">
                            <span className="text-[9px] uppercase font-bold text-[var(--secondary)]/60 flex items-center gap-1.5"><Clock size={10} className="text-[var(--accent)]" /> Duration</span>
                            <span className="text-[11px] font-black text-[var(--secondary)] mt-1 truncate">{bid.investment_duration || "Long-term"}</span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-[var(--secondary)]/10 relative z-10">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-[var(--secondary)]/70 flex items-center gap-1.5 uppercase"><Target size={12} className="text-[var(--accent)]" /> Target Sectors</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {bid.target_sectors && bid.target_sectors.length > 0 ? bid.target_sectors.map((sector: string) => (
                                    <span key={sector} className="px-2 py-0.5 text-[9px] font-bold text-[var(--secondary)] bg-[var(--secondary)]/5 rounded-md">{sector}</span>
                                )) : <span className="text-[10px] text-[var(--secondary)]/50 font-medium">Sector Agnostic</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-[var(--secondary)]/70 flex items-center gap-1.5 uppercase"><Globe size={12} className="text-[var(--accent)]" /> Target Regions</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {bid.target_countries && bid.target_countries.length > 0 ? bid.target_countries.map((country: string) => (
                                    <span key={country} className="px-2 py-0.5 text-[9px] font-bold text-[var(--secondary)] bg-[var(--secondary)]/5 rounded-md">{country}</span>
                                )) : <span className="text-[10px] text-[var(--secondary)]/50 font-medium">Global Scope</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application Selection Interface */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Option A: Select Existing Pitch */}
                    <div className="neu-flat-base p-8 space-y-6 flex flex-col">
                        <div>
                            <div className="w-12 h-12 rounded-xl neu-pressed-base border-transparent shadow-inner flex items-center justify-center text-[var(--accent)] mb-4">
                                <FileText size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--secondary)] mb-2">Submit Existing Pitch</h2>
                            <p className="text-xs text-[var(--secondary)]/70 leading-relaxed font-medium">
                                Select a master pitch deck you have already created. It will be permanently locked to this mandate upon submission.
                            </p>
                        </div>

                        <div className="flex-grow flex flex-col justify-end pt-4">
                            {existingPitches && existingPitches.length > 0 ? (
                                <MandateApplicationForm
                                    bidId={bid.id}
                                    investorId={bid.investor_id}
                                    startupId={user.id}
                                    pitches={existingPitches}
                                />
                            ) : (
                                <div className="p-4 rounded-xl border border-dashed border-[var(--secondary)]/20 bg-transparent text-center">
                                    <p className="text-xs font-bold text-[var(--secondary)]/60">No active pitch decks found in your portfolio.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Option B: Create Tailored Pitch */}
                    <div className="neu-flat-base p-8 space-y-6 flex flex-col hover:border-[var(--accent)]/50 transition group">
                        <div>
                            <div className="w-12 h-12 rounded-xl neu-pressed-base border-transparent shadow-inner flex items-center justify-center text-[var(--accent)] mb-4 group-hover:scale-110 transition">
                                <PlusCircle size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--secondary)] mb-2">Create Tailored Pitch</h2>
                            <p className="text-xs text-[var(--secondary)]/70 leading-relaxed font-medium">
                                Generate a fresh, highly targeted pitch deck specifically designed to match this investor's thesis and sector requirements.
                            </p>
                        </div>

                        <div className="flex-grow flex flex-col justify-end pt-4 space-y-3">
                            <ul className="space-y-2 mb-4">
                                <li className="flex items-center gap-2 text-xs font-bold text-[var(--secondary)]/80">
                                    <CheckCircle2 size={14} className="text-emerald-600" /> Matches investor thesis
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-[var(--secondary)]/80">
                                    <CheckCircle2 size={14} className="text-emerald-600" /> Higher conversion rate
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-[var(--secondary)]/80">
                                    <CheckCircle2 size={14} className="text-emerald-600" /> Auto-locks to this mandate
                                </li>
                            </ul>
                            <Link
                                href={`/startup/pitch/build?target_bid=${bid.id}`}
                                className="w-full text-center px-6 py-4 neu-btn text-sm inline-block"
                            >
                                Launch Builder
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}