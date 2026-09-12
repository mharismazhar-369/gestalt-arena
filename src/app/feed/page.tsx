"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SocialFeed from "@/components/social/SocialFeed";
import BetaBadge from "@/components/shared/BetaBadge";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { trackInteractionAction } from "@/app/actions";
import Link from "next/link";
import {
  MessageSquare, Users, Hash,
  Eye, FileText, Activity, Presentation, Target,
  ArrowRight, ShieldCheck, DollarSign, Store, Building
} from "lucide-react";

export default function FeedPage() {
  const { session, status, updateStatus } = useAuth();

  // Dumb state holders (UI renderers only)
  const [profile, setProfile] = useState<any>(null);
  const [deckData, setDeckData] = useState<any>(null);
  const [trendingArticles, setTrendingArticles] = useState<any[]>([]);
  const [trendingInvestors, setTrendingInvestors] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);
  const [activeStartups, setActiveStartups] = useState<any[]>([]);
  const [eligibleAds, setEligibleAds] = useState<any[]>([]);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const [metrics, setMetrics] = useState({
    posts: 0,
    articles: 0,
    views: 0
  });

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    async function fetchHydratedFeedData() {
      // 1. Fetch profile first using the safe local constant
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileData) setProfile(profileData);
      const role = profileData?.role;

      // 2. Fetch all dependent metrics and trending data concurrently
      const [
        postCountRes,
        articleCountRes,
        deckRes,
        trendArticlesRes,
        trendInvestorsRes,
        trendTagsRes,
        startupsRes,
        adsRes
      ] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", userId),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("author_id", userId),
        role === 'investor'
          ? supabase.from("investor_bid_decks").select("*").eq("investor_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle()
          : supabase.from("pitch_decks").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("articles").select("id, title, read_time").order("created_at", { ascending: false }).limit(3),
        supabase.from("profiles").select("id, nickname, company_name, ownership_type, role").eq("role", "investor").limit(3),
        supabase.rpc("get_trending_tags"),
        supabase.rpc("get_active_startups"),
        supabase.rpc("get_eligible_ads", { p_user_id: userId })
      ]);

      setMetrics({
        posts: postCountRes.count || 0,
        articles: articleCountRes.count || 0,
        views: profileData?.profile_views || profileData?.views || 0
      });

      if (deckRes.data) setDeckData(deckRes.data);
      if (trendArticlesRes.data) setTrendingArticles(trendArticlesRes.data);
      if (trendInvestorsRes.data) setTrendingInvestors(trendInvestorsRes.data);
      if (trendTagsRes.data) setTrendingTags(trendTagsRes.data);
      if (startupsRes.data) setActiveStartups(startupsRes.data);
      if (adsRes.data) setEligibleAds(adsRes.data);
    }

    fetchHydratedFeedData();
  }, [session]);

  const displayName = profile?.nickname || profile?.company_name || session?.user?.email?.split("@")[0] || "Arena Member";
  const displayRole = profile?.role === "startup" ? "Startup Founder" : profile?.role === "investor" ? "Investor" : "Platform User";
  const isStartup = profile?.role === "startup";

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
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--primary)] font-black text-xl uppercase shadow-inner">
                      {displayName.slice(0, 2)}
                    </div>

                    <div className="absolute -bottom-1 -right-1 z-20">
                      <button
                        onClick={() => {
                          trackInteractionAction("CLICK", "toggle_status_menu", { current_state: showStatusMenu });
                          setShowStatusMenu(!showStatusMenu);
                        }}
                        className={`h-4 w-4 rounded-full border-2 border-[var(--primary)] flex items-center justify-center transition-all ${statusColors[status || 'online']}`}
                      />

                      {showStatusMenu && (
                        <div className="absolute top-5 left-0 neu-flat-base p-2 rounded-xl flex flex-col gap-1 w-24 shadow-lg z-30">
                          <button onClick={() => { trackInteractionAction("CLICK", "set_status_online"); updateStatus('online'); setShowStatusMenu(false); }} className="text-[10px] font-bold text-left px-2 py-1.5 hover:bg-[var(--secondary)]/5 rounded-md flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                          </button>
                          <button onClick={() => { trackInteractionAction("CLICK", "set_status_busy"); updateStatus('busy'); setShowStatusMenu(false); }} className="text-[10px] font-bold text-left px-2 py-1.5 hover:bg-[var(--secondary)]/5 rounded-md flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Busy
                          </button>
                          <button onClick={() => { trackInteractionAction("CLICK", "set_status_away"); updateStatus('away'); setShowStatusMenu(false); }} className="text-[10px] font-bold text-left px-2 py-1.5 hover:bg-[var(--secondary)]/5 rounded-md flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Away
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-bold text-[var(--secondary)] text-sm line-clamp-1">{displayName}</h2>
                    <p className="text-[10px] font-bold text-[var(--accent)] capitalize">{displayRole}</p>
                    <p className="text-[10px] text-[var(--secondary)]/60 font-medium line-clamp-1">
                      {profile?.services_offering || profile?.industry || "Gestalt Network"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center gap-1.5 text-[var(--secondary)]/70">
                      <Eye size={12} className="text-[var(--accent)]" /> Profile Views
                    </span>
                    <span className="text-[var(--secondary)]">{metrics.views}</span>
                  </div>
                  <Link href={`/profile/${session?.user?.id}`} onClick={() => trackInteractionAction("CLICK", "nav_profile_posts")} className="flex items-center justify-between text-[10px] font-bold group">
                    <span className="flex items-center gap-1.5 text-[var(--secondary)]/75 group-hover:text-[var(--accent)] transition">
                      <MessageSquare size={12} className="text-[var(--accent)]" /> Published Posts
                    </span>
                    <span className="text-[var(--secondary)]">{metrics.posts}</span>
                  </Link>
                  <Link href="/research" onClick={() => trackInteractionAction("CLICK", "nav_research_articles")} className="flex items-center justify-between text-[10px] font-bold group">
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
                    <Link href={isStartup ? `/startup/${deckData.id}/pitch` : `/bids/${deckData.id}`} onClick={() => trackInteractionAction("CLICK", "nav_deck_details")} className="mt-2 flex items-center justify-between w-full p-2 bg-transparent hover:bg-[var(--secondary)]/5 text-[10px] font-bold text-[var(--secondary)] rounded-lg transition border border-[var(--secondary)]/10">
                      View Details <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <ShieldCheck size={24} className="mx-auto text-[var(--secondary)]/30" />
                    <p className="text-[10px] text-[var(--secondary)]/60 font-medium px-2">
                      No active {isStartup ? "pitch deck" : "mandate"} found.
                    </p>
                    <Link href={isStartup ? "/startup/pitch/build" : "/investor/bids/create"} onClick={() => trackInteractionAction("CLICK", "nav_create_deck")} className="text-[10px] font-bold text-[var(--accent)] hover:underline inline-block mt-1">
                      Create one now
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* CENTER CONTENT */}
          <section className="lg:col-span-9 xl:col-span-6 space-y-6">
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

              {/* Active Role/Subscription Ads Block (Emporium) */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <Store size={14} className="text-[var(--accent)]" /> Sponsored Emporium
                </h3>
                <div className="space-y-3">
                  {eligibleAds.length > 0 ? eligibleAds.map((ad) => (
                    <a href={ad.cta_url} target="_blank" rel="noopener noreferrer" key={ad.id} onClick={() => trackInteractionAction("CLICK", "nav_emporium_ad", { ad_id: ad.id })} className="block group neu-pressed-base p-3 rounded-xl">
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

              {/* Trending Research */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <FileText size={14} className="text-[var(--accent)]" /> Trending Research
                </h3>
                <div className="space-y-3">
                  {trendingArticles.length > 0 ? trendingArticles.map((item) => (
                    <Link href={`/research/${item.id}`} key={item.id} onClick={() => trackInteractionAction("CLICK", "nav_trending_research", { article_id: item.id })} className="group cursor-pointer block">
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

              {/* Top Capital Partners */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <Users size={14} className="text-[var(--accent)]" /> Top Capital Partners
                </h3>
                <div className="space-y-3">
                  {trendingInvestors.length > 0 ? trendingInvestors.map((inv) => (
                    <Link href={`/profile/${inv.id}`} key={inv.id} onClick={() => trackInteractionAction("CLICK", "nav_trending_investor", { investor_id: inv.id })} className="flex items-center gap-3 cursor-pointer group">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--secondary)]/5 flex items-center justify-center font-bold text-[10px] text-[var(--secondary)] group-hover:bg-[var(--accent)] group-hover:text-[var(--primary)] transition">
                        {(inv.nickname || inv.company_name || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition truncate">
                          {inv.nickname || inv.company_name}
                        </h4>
                        <span className="text-[9px] font-medium text-[var(--secondary)]/60 capitalize truncate block">
                          {inv.ownership_type || inv.role}
                        </span>
                      </div>
                    </Link>
                  )) : (
                    <p className="text-[10px] text-[var(--secondary)]/50 font-medium">No investors found.</p>
                  )}
                </div>
              </div>

              {/* Active Startups Block (Mirrors Top Capital Partners Structure) */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <Building size={14} className="text-[var(--accent)]" /> Active Startups
                </h3>
                <div className="space-y-3">
                  {activeStartups.length > 0 ? activeStartups.map((st) => (
                    <Link
                      href={`/profile/${st.id}`}
                      key={st.id}
                      onClick={() => trackInteractionAction("CLICK", "nav_active_startup", { startup_id: st.id })}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--secondary)]/5 flex items-center justify-center font-bold text-[10px] text-[var(--secondary)] group-hover:bg-[var(--accent)] group-hover:text-[var(--primary)] transition">
                        {(st.company_name || st.nickname || "US").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-[var(--secondary)] group-hover:text-[var(--accent)] transition truncate">
                          {st.company_name || st.nickname || "Stealth Startup"}
                        </h4>
                        <span className="text-[9px] font-medium text-[var(--secondary)]/60 capitalize truncate block">
                          {st.industry || st.stage || "Technology"}
                        </span>
                      </div>
                    </Link>
                  )) : (
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