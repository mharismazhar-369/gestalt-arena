import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SocialFeed from "@/components/social/SocialFeed";
import BetaBadge from "@/components/shared/BetaBadge";
import {
  MessageSquare, Users, Hash,
  Eye, FileText, Activity, Presentation, Target,
  ArrowRight, ShieldCheck, DollarSign, Store, Building, RefreshCw, Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Arena Feed & Strategic Discussions | Gestalt Arena",
  description: "Join discussions, market analyses, and founder updates on the Gestalt Arena real-time community feed.",
  alternates: {
    canonical: "/feed",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.profile_completed) {
    redirect("/dashboard");
  }

  const role = profile.role;
  const isStartup = role === "startup";

  // 2. Fetch server-side metrics, randomized research, matched investors, active startups, and ads concurrently
  const [
    postCountRes,
    articleCountRes,
    deckRes,
    trendArticlesRes,
    investorMatchesRes,
    trendTagsRes,
    startupsRes,
    adsRes
  ] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", user.id),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("author_id", user.id),
    isStartup
      ? supabase.from("pitch_decks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
      : supabase.from("investor_bid_decks").select("*").eq("investor_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    // Server-side random shuffle for Trending Research via Postgres random() order
    supabase.from("articles").select("id, title, read_time").order("random()").limit(3),
    // AI Match Engine for Top Capital Partners
    isStartup
      ? supabase.rpc("match_investors_for_startup", { p_startup_id: user.id })
      : supabase.from("profiles").select("id, nickname, company_name, ownership_type, role, username").eq("role", "investor").order("random()").limit(3),
    supabase.rpc("get_trending_tags"),
    supabase.rpc("get_active_startups"),
    // Server-side random shuffle for Sponsored Emporium
    supabase.rpc("get_eligible_ads", { p_user_id: user.id })
  ]);

  const metrics = {
    posts: postCountRes.count || 0,
    articles: articleCountRes.count || 0,
    views: profile.profile_views || profile.views || 0
  };

  const deckData = deckRes.data || null;
  const trendingArticles = trendArticlesRes.data || [];

  // Process investor matches with server-calculated scores
  const trendingInvestors = Array.isArray(investorMatchesRes.data)
    ? investorMatchesRes.data.slice(0, 3)
    : [];

  const trendingTags = trendTagsRes.data || [];
  const activeStartups = (startupsRes.data || []).slice(0, 3);

  // Randomize eligible ads server-side if returned as array
  const eligibleAds = Array.isArray(adsRes.data)
    ? [...adsRes.data].sort(() => Math.random() - 0.5)
    : [];

  const displayName = profile.nickname || profile.company_name || user.email?.split("@")[0] || "Arena Member";
  const displayNickname = profile.username ? `@${profile.username}` : `@${displayName.toLowerCase().replace(/\s+/g, '_')}`;
  const displayRole = isStartup ? "Startup Founder" : role === "investor" ? "Investor" : "Platform User";

  const statusColors: Record<string, string> = {
    online: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
    busy: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
    away: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    banned: "bg-red-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
    suspended: "bg-grey-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
  };

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-4 md:px-6 mx-auto max-w-[1400px] w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="sticky top-32 space-y-6">

              {/* Profile Card */}
              <div className="neu-flat-base p-5 space-y-6">
                <div className="flex flex-col items-center text-center space-y-3 border-b border-[var(--secondary)]/10 pb-6">
                  <div className="relative">
                    <Link href={`/profile/${user.id}`} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--primary)] font-black text-xl uppercase shadow-inner hover:opacity-90 transition">
                      {displayName.slice(0, 2)}
                    </Link>

                    <div className="absolute -bottom-1 -right-1 z-20">
                      <span className={`h-4 w-4 rounded-full border-2 border-[var(--primary)] flex items-center justify-center transition-all ${statusColors[profile.presence_status || 'online']}`} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-bold text-[var(--secondary)] text-sm line-clamp-1">{displayName}</h2>
                    <Link href={`/profile/${user.id}`} className="text-[11px] font-mono font-bold text-[var(--accent)] hover:underline inline-block">
                      {displayNickname}
                    </Link>
                    <p className="text-[10px] font-bold text-[var(--accent)]/80 capitalize">{displayRole}</p>
                    <p className="text-[10px] text-[var(--secondary)]/60 font-medium line-clamp-1">
                      {profile.services_offering || profile.industry || "Gestalt Network"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Item #2: Profile Views active link to dedicated analytics page */}
                  <Link href="/dashboard/analytics" className="flex items-center justify-between text-[10px] font-bold group cursor-pointer">
                    <span className="flex items-center gap-1.5 text-[var(--secondary)]/70 group-hover:text-[var(--accent)] transition">
                      <Eye size={12} className="text-[var(--accent)]" /> Profile Views
                    </span>
                    <span className="text-[var(--secondary)]">{metrics.views}</span>
                  </Link>

                  <Link href={`/profile/${user.id}`} className="flex items-center justify-between text-[10px] font-bold group">
                    <span className="flex items-center gap-1.5 text-[var(--secondary)]/75 group-hover:text-[var(--accent)] transition">
                      <MessageSquare size={12} className="text-[var(--accent)]" /> Published Posts
                    </span>
                    <span className="text-[var(--secondary)]">{metrics.posts}</span>
                  </Link>

                  <Link href="/research" className="flex items-center justify-between text-[10px] font-bold group">
                    <span className="flex items-center gap-1.5 text-[var(--secondary)]/70 group-hover:text-[var(--accent)] transition">
                      <FileText size={12} className="text-[var(--accent)]" /> Research Articles
                    </span>
                    <span className="text-[var(--secondary)]">{metrics.articles}</span>
                  </Link>
                </div>
              </div>

              {/* Deal/Mandate Card */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  {isStartup ? <Presentation size={14} className="text-[var(--accent)]" /> : <Target size={14} className="text-[var(--accent)]" />}
                  {isStartup ? "My Active Pitch" : "My Capital Mandate"}
                </h3>

                {deckData ? (
                  <div className="space-y-3">
                    <span className="neu-pressed-base border-transparent shadow-inner px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-[var(--accent)]">
                      {deckData.stage || deckData.status || "Active"}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--secondary)] line-clamp-2">{deckData.title}</h4>
                    <div className="neu-pressed-base p-2 shadow-inner border-transparent flex flex-col gap-1 mt-2">
                      <span className="text-[9px] uppercase font-bold text-[var(--secondary)]/50 flex items-center gap-1">
                        <DollarSign size={10} /> {isStartup ? "Target Raise" : "Allocation"}
                      </span>
                      <span className="text-sm font-mono font-bold text-[var(--secondary)]">
                        ${(deckData.funding_goal || deckData.max_allocation || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--secondary)]/70 line-clamp-3 font-medium leading-relaxed">
                      {deckData.elevator_pitch || deckData.thesis}
                    </p>
                    <Link href={isStartup ? `/startup/${deckData.id}/pitch` : `/bids/${deckData.id}`} className="mt-2 flex items-center justify-between w-full p-2 bg-transparent hover:bg-[var(--secondary)]/5 text-[10px] font-bold text-[var(--secondary)] rounded-lg transition border border-[var(--secondary)]/10">
                      View Details <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <ShieldCheck size={24} className="mx-auto text-[var(--secondary)]/30" />
                    <p className="text-[10px] text-[var(--secondary)]/60 font-medium px-2">
                      No active {isStartup ? "pitch deck" : "mandate"} found.
                    </p>
                    <Link href={isStartup ? "/startup/pitch/build" : "/investor/bids/create"} className="text-[10px] font-bold text-[var(--accent)] hover:underline inline-block mt-1">
                      Create one now
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* CENTER CONTENT */}
          <section className="lg:col-span-9 xl:col-span-6 space-y-6">
            {/* Item #1: "Refresh to update feed" notice line on top of the feed */}
            <div className="neu-flat-base p-3 px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[var(--secondary)]/80 font-medium">
                <RefreshCw size={13} className="text-[var(--accent)] animate-spin-slow" />
                <span>Refresh to update feed with latest discussions &amp; posts.</span>
              </div>
              <a
                href="/feed"
                className="neu-btn px-3 py-1 text-[10px] font-bold text-[var(--accent)] flex items-center gap-1"
              >
                Refresh Now
              </a>
            </div>

            <div className="neu-flat-base p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl neu-pressed-base border-transparent text-[var(--accent)] shadow-inner">
                  <Activity size={18} />
                </span>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent)]">
                    Arena Network
                  </span>
                  <h1 className="text-lg font-black text-[var(--secondary)]">Live Feed</h1>
                </div>
              </div>
              <BetaBadge variant="pill" className="hidden sm:inline-flex" />
            </div>

            <SocialFeed />
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden xl:block xl:col-span-3 space-y-6">
            <div className="sticky top-32 space-y-6">

              {/* Sponsored Emporium (Server-Shuffled) */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <Store size={14} className="text-[var(--accent)]" /> Sponsored Emporium
                </h3>
                <div className="space-y-3">
                  {eligibleAds.length > 0 ? eligibleAds.map((ad: any) => (
                    <a href={ad.cta_url} target="_blank" rel="noopener noreferrer" key={ad.id} className="block group neu-pressed-base p-3 rounded-xl">
                      <span className="text-[9px] uppercase tracking-wider text-[var(--accent)] font-bold">{ad.category}</span>
                      <h4 className="text-xs font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition truncate mt-0.5">
                        {ad.title}
                      </h4>
                      <p className="text-[10px] text-[var(--secondary)]/70 line-clamp-1 mt-1">{ad.description}</p>
                    </a>
                  )) : (
                    <p className="text-[10px] text-[var(--secondary)]/50 font-medium">No active campaigns for your tier.</p>
                  )}
                </div>
              </div>

              {/* Trending Research (Server-Shuffled) */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <FileText size={14} className="text-[var(--accent)]" /> Trending Research
                </h3>
                <div className="space-y-3">
                  {trendingArticles.length > 0 ? trendingArticles.map((item: any) => (
                    <Link href={`/research/${item.id}`} key={item.id} className="group cursor-pointer block">
                      <h4 className="text-xs font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition line-clamp-2 leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-medium text-[var(--secondary)]/50 mt-1 block">
                        {item.read_time || "5 min read"}
                      </span>
                    </Link>
                  )) : (
                    <p className="text-[10px] text-[var(--secondary)]/50 font-medium">No articles published yet.</p>
                  )}
                </div>
              </div>

              {/* Top Capital Partners (AI Engine Match Scores) */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center justify-between border-b border-[var(--secondary)]/10 pb-3">
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--accent)]" /> Top Capital Partners
                  </span>
                  <span className="text-[9px] font-bold text-[var(--accent)] neu-pressed-base px-2 py-0.5 rounded">AI Matched</span>
                </h3>
                <div className="space-y-3">
                  {trendingInvestors.length > 0 ? trendingInvestors.map((inv: any, idx: number) => {
                    const invName = inv.nickname || inv.company_name || "Investor";
                    const invHandle = inv.username ? `@${inv.username}` : `@partner_${idx + 1}`;
                    const matchScore = inv.match_score || (95 - idx * 5);

                    return (
                      <Link href={`/profile/${inv.id}`} key={inv.id} className="flex items-center justify-between cursor-pointer group p-2 rounded-xl neu-pressed-base">
                        <div className="flex items-center gap-3 truncate">
                          <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--secondary)]/5 flex items-center justify-center font-bold text-[10px] text-[var(--secondary)] group-hover:bg-[var(--accent)] group-hover:text-[var(--primary)] transition">
                            {invName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition truncate">
                              {invName}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-[var(--accent)] truncate block">
                              {invHandle}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-[var(--accent)] shrink-0 pl-2">
                          {matchScore}% Match
                        </span>
                      </Link>
                    );
                  }) : (
                    <p className="text-[10px] text-[var(--secondary)]/50 font-medium">No investors found.</p>
                  )}
                </div>
              </div>

              {/* Active Startups Block */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <Building size={14} className="text-[var(--accent)]" /> Active Startups
                </h3>
                <div className="space-y-3">
                  {activeStartups.length > 0 ? activeStartups.map((st: any, idx: number) => {
                    const stName = st.company_name || st.nickname || "Stealth Startup";
                    const stHandle = st.username ? `@${st.username}` : `@startup_${idx + 1}`;

                    return (
                      <Link
                        href={`/profile/${st.id}`}
                        key={st.id}
                        className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl neu-pressed-base"
                      >
                        <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--secondary)]/5 flex items-center justify-center font-bold text-[10px] text-[var(--secondary)] group-hover:bg-[var(--accent)] group-hover:text-[var(--primary)] transition">
                          {stName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition truncate">
                            {stName}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-[var(--accent)] truncate block">
                            {stHandle}
                          </span>
                        </div>
                      </Link>
                    );
                  }) : (
                    <p className="text-[10px] text-[var(--secondary)]/50 font-medium">No active startups found.</p>
                  )}
                </div>
              </div>

              {/* Backend-Parsed Trending Hashtags */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <Hash size={14} className="text-[var(--accent)]" /> Trending Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.length > 0 ? trendingTags.map((item: any) => (
                    <span key={item.tag} className="px-2 py-1 rounded-md text-[10px] font-bold text-[var(--secondary)]/70 neu-pressed-base border-transparent shadow-inner cursor-pointer hover:text-[var(--accent)] transition">
                      {item.tag} ({item.count})
                    </span>
                  )) : (
                    <p className="text-[10px] text-[var(--secondary)]/50 font-medium">Post with hashtags to start trending.</p>
                  )}
                </div>
              </div>

            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}