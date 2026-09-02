export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";
import { Compass, Rocket, BookOpen, ShieldCheck, User, Sparkles, Settings, MapPin, DollarSign, Building2, Briefcase, Target, Plus, FileText, ChevronDown, Eye, Folder, Radio, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import InvestorProfileBuilder from "@/components/investor/InvestorProfileBuilder";
import PitchDeckViewer from "@/components/pitch/PitchDeckViewer";

export default async function InvestorDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "startup") {
    redirect("/startup/dashboard");
  }

  if (!profile?.profile_completed) {
    return (
      <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
        <Navbar />
        <main className="pt-32 pb-24 px-6 mx-auto max-w-3xl w-full relative z-10 space-y-10">
          <InvestorProfileBuilder profile={profile} />
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = profile?.nickname || profile?.company_name || user.email?.split("@")[0] || "Investor Partner";
  const displayLocation = profile?.city ? `${profile.city}, ${profile.country || ""}` : "Global Network";
  const displayTier = profile?.tier || "freemium";

  // Fetch active bid decks AND their nested private deal negotiations
  const { data: bidDecks, error: bidError } = await supabase
    .from("investor_bid_decks")
    .select(`
      *,
      deal_negotiations (
        id,
        status,
        created_at,
        pitch_deck_id,
        profiles!deal_negotiations_startup_id_fkey (company_name, nickname)
      )
    `)
    .eq("investor_id", user.id)
    .order("created_at", { ascending: false });

  if (bidError) {
    console.error("Dashboard Fetch Error:", bidError);
  }

  // Fetch User's Live Feed Activity
  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const totalMandates = bidDecks?.length || 0;
  const totalDeals = bidDecks?.reduce((acc, deck) => acc + (deck.deal_negotiations?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-8">

        {/* Dynamic Header Banner */}
        <div className="trionn-glass-card rounded-3xl border border-cyan-500/30 p-8 md:p-10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="absolute top-0 right-0 p-8 text-cyan-500/10 pointer-events-none">
            <Compass size={220} />
          </div>

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Investor Portal
              </span>
              <BetaBadge variant="pill" />
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent capitalize">
                {displayName}
              </span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Window-shop verified early-stage startups, track deal flows, and evaluate pitch cards across deep-tech, AI, and SaaS sectors.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-3 min-w-[200px]">
            <Link
              href="/dashboard/preferences"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 transition text-sm font-bold text-white shadow-lg"
            >
              <Settings size={16} className="text-cyan-400" /> Global Settings
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Live Database Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Sparkles size={12} className="text-violet-400" /> Membership Tier</span>
            <span className="text-lg font-black text-white capitalize">{displayTier}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} className="text-cyan-400" /> Operating Region</span>
            <span className="text-lg font-black text-white truncate">{displayLocation}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><DollarSign size={12} className="text-emerald-400" /> Target Ticket</span>
            <span className="text-lg font-black text-white">{profile?.ticket_size || "Flexible"}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={12} className="text-amber-400" /> Sector Focus</span>
            <span className="text-lg font-black text-white truncate">{profile?.industries_of_interest?.[0] || "Agnostic"}</span>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/browse/startups"
            className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-4 hover:border-cyan-400/50 transition group shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Rocket size={24} />
              </div>
              <span className="text-xs text-cyan-400 font-bold group-hover:underline">Explore →</span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300">Browse Startup Directory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filter startup pitch cards by raise ask, industry, valuation, and technology moat.
            </p>
          </Link>

          <Link
            href="/research"
            className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-4 hover:border-violet-400/50 transition group shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <BookOpen size={24} />
              </div>
              <span className="text-xs text-violet-400 font-bold group-hover:underline">Publish →</span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-violet-300">Research & Thesis Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Publish investment thesis articles, sector reports, and market insights.
            </p>
          </Link>

          <Link
            href="/pricing"
            className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-4 hover:border-amber-400/50 transition group shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles size={24} />
              </div>
              <span className="text-xs text-amber-400 font-bold group-hover:underline">Tier Settings →</span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-amber-300">Membership & Quotas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage investment transaction caps, post quotas, and verified investor badges.
            </p>
          </Link>
        </div>

        {/* Reverse Pitching / Active Bids Section */}
        <div className="trionn-glass-card rounded-3xl border border-cyan-500/30 p-8 shadow-2xl relative overflow-hidden mt-8">
          <div className="absolute top-0 right-0 p-6 text-cyan-500/5 pointer-events-none">
            <Target size={120} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 relative z-10 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target size={20} className="text-cyan-400" /> Capital Mandates & Deal Flow
              </h2>
              <p className="text-xs text-slate-400 mt-1">Manage your active bids, evaluate incoming pitches, and track deal negotiations.</p>
            </div>

            <Link
              href="/investor/bids/create"
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg hover:scale-105 hover:bg-cyan-400 transition shrink-0"
            >
              <Plus size={16} /> Create Bid Deck
            </Link>
          </div>

          <div className="pt-6 relative z-10">
            {bidDecks && bidDecks.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {bidDecks.map((deck) => (
                  <div key={deck.id} className="rounded-2xl border border-white/10 bg-[#060a12] p-6 space-y-4 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {deck.status}
                        </span>
                        <h3 className="font-bold text-white text-lg leading-tight mt-2">{deck.title}</h3>
                      </div>
                      <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                        Alloc: ${deck.max_allocation?.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{deck.thesis}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                      <Link
                        href={`/bids/${deck.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-cyan-300 border border-cyan-500/20 transition"
                      >
                        <Eye size={14} /> Public View
                      </Link>
                      <DeleteResourceButton table="investor_bid_decks" recordId={deck.id} itemName="Mandate" />
                    </div>

                    {/* Private Negotiations Pipeline with Live Chat Routing */}
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        Private Deal Threads
                        <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">{deck.deal_negotiations?.length || 0}</span>
                      </h4>

                      {deck.deal_negotiations && deck.deal_negotiations.length > 0 ? (
                        <div className="space-y-3">
                          {deck.deal_negotiations.map((deal: any) => {
                            const startupProfile = Array.isArray(deal.profiles) ? deal.profiles[0] : deal.profiles;
                            const startupName = startupProfile?.company_name || startupProfile?.nickname || "Startup";
                            return (
                              <details key={deal.id} className="group bg-black/60 rounded-xl border border-cyan-500/20 overflow-hidden transition-all duration-300">
                                <summary className="flex items-center justify-between p-3 cursor-pointer list-none hover:bg-white/5 transition-colors [&::-webkit-details-marker]:hidden">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-bold text-white line-clamp-1 flex items-center gap-2">
                                      <ChevronDown size={14} className="text-slate-500 group-open:-rotate-180 transition-transform" />
                                      {startupName}
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-400 ml-5 flex items-center gap-1">
                                      Status: {deal.status}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-md group-open:hidden">
                                      Review Pitch
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 bg-white/10 border border-white/10 px-3 py-1 rounded-md hidden group-open:block">
                                      Close
                                    </span>
                                  </div>
                                </summary>

                                <div className="p-4 border-t border-white/5 bg-[#02040a]">
                                  <Suspense fallback={
                                    <div className="text-xs text-cyan-400 p-6 text-center animate-pulse border border-dashed border-cyan-500/30 rounded-xl bg-cyan-500/5">
                                      Retrieving {startupName}'s live pitch deck...
                                    </div>
                                  }>
                                    <PitchDeckViewer pitchId={deal.pitch_deck_id} />
                                  </Suspense>

                                  {/* Replaced Phase 2 placeholder with Actual Live Routing */}
                                  <div className="mt-4 p-4 border border-cyan-500/30 bg-cyan-500/5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <span className="text-xs text-cyan-300 font-bold">Deal thread active.</span>
                                    <Link
                                      href={`/negotiations/${deal.id}`}
                                      className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-black bg-cyan-500 hover:bg-cyan-400 hover:scale-105 rounded-xl transition shadow-lg shadow-cyan-500/20 w-full sm:w-auto"
                                    >
                                      <CheckCircle2 size={14} /> Enter Deal Room
                                    </Link>
                                  </div>
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No deal negotiations initiated yet.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
                <FileText size={40} className="text-slate-500 mb-4" />
                <p className="text-base font-bold text-slate-300">No Active Mandates</p>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                  You haven't published any Bid Decks yet. Create one to start receiving targeted startup pitches.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Investor Metrics Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 flex items-center gap-4 shadow-xl">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Folder size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Deal Threads</p>
              <h4 className="text-3xl font-black text-white">{totalDeals}</h4>
            </div>
          </div>

          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 flex items-center gap-4 shadow-xl">
            <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mandates Published</p>
              <h4 className="text-3xl font-black text-white">{totalMandates}</h4>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Detailed Profile Data Card */}
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
              <Building2 size={300} />
            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User size={18} className="text-cyan-400" /> Investor Profile Record
              </h3>
            </div>

            <div className="grid md:grid-cols-1 gap-6 relative z-10">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">User Account Email</span>
                  <p className="font-mono text-white text-sm">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">System Role</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 font-bold text-cyan-300 capitalize text-xs mt-1">
                    <ShieldCheck size={12} /> {profile?.role || "investor"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Investment Thesis</span>
                  <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                    {profile?.investment_thesis || profile?.bio || "No thesis provided yet."}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Supabase UUID</span>
                  <p className="font-mono text-cyan-400/50 text-[10px] break-all">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arena Feed Activity Card */}
          <div className="trionn-glass-card rounded-3xl border border-cyan-500/30 p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-cyan-500/5 pointer-events-none">
              <Radio size={120} />
            </div>

            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio size={18} className="text-cyan-400" /> My Recent Arena Posts
              </h3>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {!posts || posts.length === 0 ? (
                <p className="text-sm text-slate-400">You haven't broadcasted to the Arena Feed yet.</p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.02] hover:bg-cyan-500/[0.05] transition space-y-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                        Broadcast
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(post.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 line-clamp-3">{post.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}