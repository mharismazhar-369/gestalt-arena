import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SubmitPitchButton from "@/components/bids/SubmitPitchButton";
import { Target, DollarSign, Briefcase, Building2, MapPin, CheckCircle2 } from "lucide-react";

export default async function BidDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch the active mandate and investor profile
    const { data: bid, error: bidError } = await supabase
        .from("investor_bid_decks")
        .select(`
      *,
      profiles:investor_id (nickname, company_name, tier, city, country, bio)
    `)
        .eq("id", id)
        .single();

    if (bidError || !bid) {
        redirect("/browse/bids");
    }

    // Fetch the current user's profile to verify they are a startup
    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const isStartup = currentUserProfile?.role === "startup";

    // Check if the startup has an active pitch deck to submit
    let startupPitchDeckId = null;
    let alreadySubmitted = false;

    if (isStartup) {
        const { data: pitchDeck } = await supabase
            .from("pitch_decks")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (pitchDeck) {
            startupPitchDeckId = pitchDeck.id;

            // Check if already submitted
            const { data: existingSubmission } = await supabase
                .from("investor_bid_submissions")
                .select("id")
                .eq("bid_deck_id", bid.id)
                .eq("startup_id", user.id)
                .maybeSingle();

            if (existingSubmission) {
                alreadySubmitted = true;
            }
        }
    }

    const profile = Array.isArray(bid.profiles) ? bid.profiles[0] : bid.profiles;
    const investorName = profile?.company_name || profile?.nickname || "Undisclosed Fund";
    const location = profile?.city ? `${profile.city}, ${profile.country || ""}` : "Global Network";

    return (
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-5xl w-full relative z-10 space-y-8">

                {/* Header Content */}
                <div className="trionn-glass-card rounded-3xl border border-cyan-500/30 p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 text-cyan-500/5 pointer-events-none">
                        <Target size={200} />
                    </div>

                    <div className="relative z-10 grid md:grid-cols-3 gap-10">
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                    Active Mandate
                                </span>
                                {profile?.tier && (
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-white/10 px-3 py-1 rounded-full">
                                        {profile.tier} Investor
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                                {bid.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-slate-400">
                                <span className="flex items-center gap-1.5"><Building2 size={16} className="text-cyan-400" /> {investorName}</span>
                                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-violet-400" /> {location}</span>
                            </div>

                            <div className="pt-4 space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Investment Thesis</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    {bid.thesis}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Sectors</h3>
                                <div className="flex flex-wrap gap-2">
                                    {bid.target_sectors?.map((sector: string, i: number) => (
                                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                                            <CheckCircle2 size={12} className="text-cyan-400" /> {sector}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Application Sidebar */}
                        <div className="space-y-6">
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6 backdrop-blur-md">
                                <div className="space-y-1 pb-4 border-b border-white/10">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <DollarSign size={12} className="text-emerald-400" /> Maximum Allocation
                                    </span>
                                    <p className="text-3xl font-black text-white">${bid.max_allocation?.toLocaleString()}</p>
                                </div>

                                <div className="space-y-1 pb-4 border-b border-white/10">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Briefcase size={12} className="text-violet-400" /> Minimum ARR Required
                                    </span>
                                    <p className="text-2xl font-black text-white">${bid.min_arr?.toLocaleString()}</p>
                                </div>

                                {isStartup ? (
                                    <SubmitPitchButton
                                        bidDeckId={bid.id}
                                        startupId={user.id}
                                        pitchDeckId={startupPitchDeckId}
                                        alreadySubmitted={alreadySubmitted}
                                    />
                                ) : (
                                    <div className="text-center p-4 rounded-xl bg-slate-900 border border-slate-800">
                                        <p className="text-xs text-slate-500 font-bold">Only startup founders can apply to capital mandates.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}