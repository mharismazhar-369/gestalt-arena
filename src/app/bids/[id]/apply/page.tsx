import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Target, ArrowLeft, FileText, PlusCircle, CheckCircle2 } from "lucide-react";
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

    // 2. Fetch the Founder's Existing Pitch Decks
    const { data: existingPitches } = await supabase
        .from("pitch_decks")
        .select("id, title, stage, funding_goal")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    const profile = Array.isArray(bid.profiles) ? bid.profiles[0] : bid.profiles;
    const investorName = profile?.company_name || profile?.nickname || "Undisclosed Investor";

    return (
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10 space-y-8">
                <Link href={`/bids/${bid.id}`} className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-cyan-400 transition">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Mandate Details
                </Link>

                {/* Mandate Summary Card */}
                <div className="trionn-glass-card rounded-3xl border border-cyan-500/30 p-8 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-6 text-cyan-500/5 pointer-events-none">
                        <Target size={120} />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            Applying To Mandate
                        </span>
                        <h1 className="text-3xl font-black text-white">{bid.title}</h1>
                        <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                            <span className="text-cyan-400">Capital Allocator:</span> {investorName}
                        </p>
                        <div className="flex gap-4 text-xs font-mono text-emerald-400 pt-4">
                            <span>Max Alloc: ${bid.max_allocation?.toLocaleString()}</span>
                            <span>Min ARR: ${bid.min_arr?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Application Selection Interface */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Option A: Select Existing Pitch */}
                    <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 space-y-6 flex flex-col">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
                                <FileText size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Submit Existing Pitch</h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Select a master pitch deck you have already created. A private deal thread will be initiated without altering your original deck.
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
                                <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/5 text-center">
                                    <p className="text-xs font-bold text-slate-500">No active pitch decks found in your portfolio.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Option B: Create Tailored Pitch */}
                    <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 space-y-6 flex flex-col hover:border-cyan-400/50 transition group">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
                                <PlusCircle size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Create Tailored Pitch</h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Generate a fresh, highly targeted pitch deck specifically designed to match this investor's thesis and sector requirements.
                            </p>
                        </div>

                        <div className="flex-grow flex flex-col justify-end pt-4 space-y-3">
                            <ul className="space-y-2 mb-4">
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                    <CheckCircle2 size={14} className="text-emerald-400" /> Matches investor thesis
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                    <CheckCircle2 size={14} className="text-emerald-400" /> Higher conversion rate
                                </li>
                            </ul>

                            {/* Note: target_bid param passes context to your pitch builder */}
                            <Link
                                href={`/startup/pitch/build?target_bid=${bid.id}`}
                                className="w-full text-center px-6 py-4 rounded-xl bg-cyan-500 text-black font-black text-sm hover:bg-cyan-400 transition"
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