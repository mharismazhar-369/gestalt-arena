"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SocialFeed from "@/components/social/SocialFeed";
import BetaBadge from "@/components/shared/BetaBadge";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import {
  MessageSquare, Users, Hash,
  Eye, FileText, Activity, Presentation, Target,
  ArrowRight, ShieldCheck, DollarSign
} from "lucide-react";

const trackInteraction = (eventType: "CLICK" | "INPUT", element: string, metadata?: any) => {
  console.log(`[Telemetry] ${eventType} -> ${element}`, metadata);
};

export default function FeedPage() {
  const { session } = useAuth();

  // Real Data States
  const [profile, setProfile] = useState<any>(null);
  const [deckData, setDeckData] = useState<any>(null);
  const [trendingArticles, setTrendingArticles] = useState<any[]>([]);
  const [trendingInvestors, setTrendingInvestors] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  // Real-time Status State
  const [status, setStatus] = useState<'online' | 'busy' | 'away'>('online');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Activity Metrics
  const [metrics, setMetrics] = useState({
    posts: 0,
    articles: 0,
    views: 0
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchLivePlatformData() {
      // 1. Fetch User Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session!.user!.id)
        .single();

      if (profileData) setProfile(profileData);

      // 2. Fetch User Metrics (Posts, Articles, and Views)
      const [
        { count: postCount },
        { count: articleCount }
      ] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", session!.user!.id),
        supabase.from("articles").select("*", { count: "exact", head: true }).eq("author_id", session!.user!.id)
      ]);

      setMetrics({
        posts: postCount || 0,
        articles: articleCount || 0,
        // Checks for 'profile_views' or 'views' column. Defaults to 0 if null.
        views: profileData?.profile_views || profileData?.views || 0
      });

      // 3. Fetch User Deck / Mandate
      if (profileData?.role === "startup") {
        const { data: deck } = await supabase.from("pitch_decks")
          .select("*").eq("user_id", session!.user!.id).order("created_at", { ascending: false }).limit(1).single();
        setDeckData(deck || null);
      } else if (profileData?.role === "investor") {
        const { data: bid } = await supabase.from("investor_bid_decks")
          .select("*").eq("investor_id", session!.user!.id).order("created_at", { ascending: false }).limit(1).single();
        setDeckData(bid || null);
      }

      // 4. Fetch Trending Aggregations (Right Column)
      const [
        { data: trendArticles },
        { data: trendInvestors },
        { data: recentPosts }
      ] = await Promise.all([
        supabase.from("articles").select("id, title, read_time").order("created_at", { ascending: false }).limit(3),
        supabase.from("profiles").select("id, nickname, company_name, ownership_type, role").eq("role", "investor").limit(3),
        supabase.from("posts").select("content").order("created_at", { ascending: false }).limit(100) // For hashtag parsing
      ]);

      if (trendArticles) setTrendingArticles(trendArticles);
      if (trendInvestors) setTrendingInvestors(trendInvestors);

      // Parse Hashtags from recent posts
      if (recentPosts) {
        const tags: Record<string, number> = {};
        recentPosts.forEach(post => {
          const matches = post.content?.match(/#\w+/g) || [];
          matches.forEach((tag: string) => tags[tag] = (tags[tag] || 0) + 1);
        });
        const sortedTags = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);
        setTrendingTags(sortedTags);
      }
    }

    fetchLivePlatformData();
  }, [session]);

  const displayName = profile?.nickname || profile?.company_name || session?.user?.email?.split("@")[0] || "Arena Member";
  const displayRole = profile?.role === "startup" ? "Startup Founder" : profile?.role === "investor" ? "Investor" : "Platform User";
  const isStartup = profile?.role === "startup";

  const statusColors = {
    online: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
    busy: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
    away: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
  };

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-4 md:px-6 mx-auto max-w-[1400px] w-full relative z-10">

        {/* 3-Column Layout on Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ======================= */}
          {/* LEFT SIDEBAR (Profile + Deck) */}
          {/* ======================= */}
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
                          trackInteraction("CLICK", "toggle_status_menu", { current_state: showStatusMenu });
                          setShowStatusMenu(!showStatusMenu);
                        }}
                        className={`h-4 w-4 rounded-full border-2 border-[var(--primary)] flex items-center justify-center transition-all ${statusColors[status]}`}
                      />

                      {showStatusMenu && (
                        <div className="absolute top-5 left-0 neu-flat-base p-2 rounded-xl flex flex-col gap-1 w-24 shadow-lg">
                          <button onClick={() => { trackInteraction("CLICK", "set_status_online"); setStatus('online'); setShowStatusMenu(false); }} className="text-[10px] font-bold text-left px-2 py-1.5 hover:bg-[var(--secondary)]/5 rounded-md flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                          </button>
                          <button onClick={() => { trackInteraction("CLICK", "set_status_busy"); setStatus('busy'); setShowStatusMenu(false); }} className="text-[10px] font-bold text-left px-2 py-1.5 hover:bg-[var(--secondary)]/5 rounded-md flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Busy
                          </button>
                          <button onClick={() => { trackInteraction("CLICK", "set_status_away"); setStatus('away'); setShowStatusMenu(false); }} className="text-[10px] font-bold text-left px-2 py-1.5 hover:bg-[var(--secondary)]/5 rounded-md flex items-center gap-2">
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
                  {/* Changed to a standard div to display exact db value without acting as a link */}
                  <div className="flex items-center justify-between text-[10px] font-bold group">
                    <span className="flex items-center gap-1.5 text-[var(--secondary)]/70">
                      <Eye size={12} className="text-[var(--accent)]" /> Profile Views
                    </span>
                    <span className="text-[var(--secondary)]">{metrics.views}</span>
                  </div>

                  <Link href={`/profile/${session?.user?.id}`} onClick={() => trackInteraction("CLICK", "nav_profile_posts")} className="flex items-center justify-between text-[10px] font-bold group cursor-pointer">
                    <span className="flex items-center gap-1.5 text-[var(--secondary)]/70 group-hover:text-[var(--accent)] transition">
                      <MessageSquare size={12} className="text-[var(--accent)]" /> Published Posts
                    </span>
                    <span className="text-[var(--secondary)] group-hover:text-[var(--accent)] transition">{metrics.posts}</span>
                  </Link>
                  <Link href="/research" onClick={() => trackInteraction("CLICK", "nav_research_articles")} className="flex items-center justify-between text-[10px] font-bold group cursor-pointer">
                    <span className="flex items-center gap-1.5 text-[var(--secondary)]/70 group-hover:text-[var(--accent)] transition">
                      <FileText size={12} className="text-[var(--accent)]" /> Research Articles
                    </span>
                    <span className="text-[var(--secondary)] group-hover:text-[var(--accent)] transition">{metrics.articles}</span>
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

                    <Link href={isStartup ? `/startup/${deckData.id}/pitch` : `/bids/${deckData.id}`} onClick={() => trackInteraction("CLICK", "nav_deck_details", { type: isStartup ? "pitch" : "mandate", id: deckData.id })} className="mt-2 flex items-center justify-between w-full p-2 bg-transparent hover:bg-[var(--secondary)]/5 text-[10px] font-bold text-[var(--secondary)] rounded-lg transition border border-[var(--secondary)]/10">
                      View Details <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <ShieldCheck size={24} className="mx-auto text-[var(--secondary)]/30" />
                    <p className="text-[10px] text-[var(--secondary)]/60 font-medium px-2">
                      No active {isStartup ? "pitch deck" : "mandate"} found.
                    </p>
                    <Link href={isStartup ? "/startup/pitch/build" : "/investor/bids/create"} onClick={() => trackInteraction("CLICK", "nav_create_deck", { type: isStartup ? "pitch" : "mandate" })} className="text-[10px] font-bold text-[var(--accent)] hover:underline inline-block mt-1">
                      Create one now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ======================= */}
          {/* CENTER CONTENT (Feed)   */}
          {/* ======================= */}
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

          {/* ======================= */}
          {/* RIGHT SIDEBAR (Trends)  */}
          {/* ======================= */}
          <aside className="hidden xl:block xl:col-span-3 space-y-6">
            <div className="sticky top-32 space-y-6">

              {/* DB Trending Articles */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <FileText size={14} className="text-[var(--accent)]" /> Trending Research
                </h3>
                <div className="space-y-3">
                  {trendingArticles.length > 0 ? trendingArticles.map((item) => (
                    <Link href={`/research/${item.id}`} key={item.id} onClick={() => trackInteraction("CLICK", "nav_trending_research", { article_id: item.id })} className="group cursor-pointer block">
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

              {/* DB Active Investors */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <Users size={14} className="text-[var(--accent)]" /> Top Capital Partners
                </h3>
                <div className="space-y-3">
                  {trendingInvestors.length > 0 ? trendingInvestors.map((inv) => (
                    <Link href={`/profile/${inv.id}`} key={inv.id} onClick={() => trackInteraction("CLICK", "nav_trending_investor", { investor_id: inv.id })} className="flex items-center gap-3 cursor-pointer group">
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

              {/* Parsed Trending Hashtags */}
              <div className="neu-flat-base p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                  <Hash size={14} className="text-[var(--accent)]" /> Trending Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.length > 0 ? trendingTags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 rounded-md text-[10px] font-bold text-[var(--secondary)]/70 neu-pressed-base border-transparent shadow-inner cursor-pointer hover:text-[var(--accent)] transition">
                      {tag}
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