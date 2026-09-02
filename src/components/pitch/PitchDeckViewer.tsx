import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Building, PieChart, FileText, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function PitchDeckViewer({ pitchId }: { pitchId: string }) {
    const supabase = await createClient();

    const { data: opp, error } = await supabase
        .from("pitch_decks")
        .select(`
      *,
      profiles:user_id (company_name, city, country)
    `)
        .eq("id", pitchId)
        .single();

    if (error || !opp) {
        return (
            <div className="trionn-glass-card rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-400 text-sm font-bold">
                Fundraising data could not be retrieved.
            </div>
        );
    }

    const profile = Array.isArray(opp.profiles) ? opp.profiles[0] : opp.profiles;
    const companyName = profile?.company_name || opp.company_name || "Undisclosed Startup";
    const location = profile?.city ? `${profile.city}, ${profile.country || ""}` : "Global Network";

    const amountRaised = opp.amount_raised || 0;
    const fundingGoal = opp.funding_goal || 1;
    const progressPercentage = Math.min(Math.round((amountRaised / fundingGoal) * 100), 100);

    return (
        <div className="space-y-6 w-full text-white">
            {/* Main Header Card */}
            <div className="trionn-glass-card rounded-3xl border border-white/10 overflow-hidden shadow-xl">
                <div className="p-8 border-b border-white/10 bg-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                    {opp.stage || "Seed"}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active Raise
                                </span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight mb-3 text-white">{opp.title || companyName}</h2>
                            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                                {opp.elevator_pitch || opp.description || "No description provided."}
                            </p>
                        </div>

                        {opp.deck_url && (
                            <a
                                href={opp.deck_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-bold rounded-xl hover:bg-cyan-400 hover:text-black transition-all shadow-lg shadow-cyan-500/10"
                            >
                                <FileText className="w-4 h-4" /> View Pitch Deck
                            </a>
                        )}
                    </div>
                </div>

                {/* Financials Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-black/40">
                    <div className="p-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Raise</p>
                        <p className="text-xl font-black text-white">${(opp.funding_goal || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pre-Money Valuation</p>
                        <p className="text-xl font-black text-white">${(opp.valuation || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min. Ticket Size</p>
                        <p className="text-xl font-black text-white">${(opp.min_ticket || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Equity Offered</p>
                        <p className="text-xl font-black text-white">{opp.equity_offered || "TBD"}%</p>
                    </div>
                </div>

                {/* Funding Progress Bar */}
                <div className="p-8 bg-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Funding Progress</h3>
                    <div className="mb-2 flex justify-between text-xs font-bold">
                        <span className="text-cyan-400">${amountRaised.toLocaleString()} committed</span>
                        <span className="text-slate-500">{progressPercentage}% of ${(opp.funding_goal || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-in-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <section className="trionn-glass-card border border-white/10 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-white border-b border-white/10 pb-4">
                            <TrendingUp className="w-5 h-5 text-cyan-400" /> Traction & Metrics
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-300">
                            {opp.traction || "Early stage development. No specific traction metrics disclosed yet."}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current MRR</p>
                                <p className="text-lg font-black text-white">${(opp.revenue || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Burn</p>
                                <p className="text-lg font-black text-white">${(opp.burn_rate || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Runway</p>
                                <p className="text-lg font-black text-white">{opp.runway_months || 0} months</p>
                            </div>
                        </div>
                    </section>

                    <section className="trionn-glass-card border border-white/10 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white border-b border-white/10 pb-4">
                            <PieChart className="w-5 h-5 text-violet-400" /> Use of Funds
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-300">
                            {opp.use_of_funds || "Fund allocation details pending founder update."}
                        </p>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="trionn-glass-card border border-white/10 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-white border-b border-white/10 pb-4">
                            <Building className="w-5 h-5 text-amber-400" /> Company Profile
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</p>
                                <p className="font-bold text-sm text-white">{companyName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Headquarters</p>
                                <p className="font-bold text-sm text-white">{location}</p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-white/10">
                                <Link href={`/startup/${opp.user_id}`} className="text-cyan-400 font-bold hover:text-cyan-300 transition flex items-center gap-1 text-xs">
                                    View full startup profile <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}