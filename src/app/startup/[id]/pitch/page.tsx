import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PitchActionBar from "@/components/pitch/PitchActionBar";
import { Eye, Star, Target, TrendingUp, Users, Wallet } from "lucide-react";

export default async function PitchDeckView({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // TODO: Replace with actual DB fetch once schema is designed
    const mockPitchData = {
        id: params.id,
        startup_id: "startup-uuid-123",
        company_name: "Gestalt Technologies",
        title: "AI-Powered Deal Flow Automation",
        elevator_pitch: "We automate the due diligence process for VC firms using deterministic matching and live data feeds.",
        stage: "Seed",
        funding_goal: "$500,000",
        min_ticket: "$25,000",
        valuation: "$4,000,000 Post-money",
        traction: "$12k MRR, 14 Active VC Pilots",
        views: 142,
        rating: 4.8,
        rating_count: 12,
        deck_url: "https://example.com/deck.pdf",
        tier_required: "pro",
    };

    return (
        <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
            <Navbar />

            <main className="pt-32 pb-32 px-6 mx-auto max-w-6xl w-full relative z-10 space-y-8">

                {/* Header & Core Metrics */}
                <div className="trionn-glass-card rounded-3xl border border-violet-500/30 p-8 md:p-10 relative overflow-hidden shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300">
                                {mockPitchData.stage} Round
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-white">
                                {mockPitchData.title}
                            </h1>
                            <p className="text-lg text-slate-300 max-w-2xl">
                                {mockPitchData.elevator_pitch}
                            </p>
                        </div>

                        {/* View & Rating Analytics */}
                        <div className="flex gap-6 border border-white/10 bg-white/5 p-4 rounded-2xl backdrop-blur-md">
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <div className="flex items-center gap-1.5 text-cyan-400">
                                    <Eye size={20} />
                                    <span className="text-xl font-bold">{mockPitchData.views}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Views</span>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <div className="flex items-center gap-1.5 text-amber-400">
                                    <Star size={20} fill="currentColor" />
                                    <span className="text-xl font-bold">{mockPitchData.rating}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{mockPitchData.rating_count} Ratings</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financials & Traction Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="trionn-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
                        <Target className="text-cyan-400 mb-2" size={24} />
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Raise Target</p>
                        <p className="text-xl font-bold text-white">{mockPitchData.funding_goal}</p>
                    </div>
                    <div className="trionn-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
                        <Wallet className="text-emerald-400 mb-2" size={24} />
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Min Ticket</p>
                        <p className="text-xl font-bold text-white">{mockPitchData.min_ticket}</p>
                    </div>
                    <div className="trionn-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
                        <TrendingUp className="text-pink-400 mb-2" size={24} />
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Valuation</p>
                        <p className="text-xl font-bold text-white">{mockPitchData.valuation}</p>
                    </div>
                    <div className="trionn-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
                        <Users className="text-orange-400 mb-2" size={24} />
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Traction</p>
                        <p className="text-xl font-bold text-white">{mockPitchData.traction}</p>
                    </div>
                </div>

                {/* Deck Viewer Placeholder */}
                <div className="trionn-glass-card rounded-3xl border border-white/10 p-2 md:p-4 aspect-video relative flex items-center justify-center bg-black/50">
                    <p className="text-slate-500 font-mono">Interactive Pitch Deck Viewer / PDF Embed Goes Here</p>
                </div>

            </main>

            {/* Floating Action Bar */}
            <PitchActionBar
                pitchId={mockPitchData.id}
                startupId={mockPitchData.startup_id}
                currentUserId={user.id}
            />

            <Footer />
        </div>
    );
}