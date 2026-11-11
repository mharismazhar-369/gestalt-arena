export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import {
    BarChart3, Eye, Users, ThumbsUp, ThumbsDown, FileText, Activity, Presentation, ArrowLeft, ShieldCheck, ExternalLink, MessageSquare, Sparkles, TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
    title: "Platform Activity & Analytics | Gestalt Arena",
    description: "Monitor engagement, post interactions, deck performance, and article metrics across Gestalt Arena.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function ProfileAnalyticsPage() {
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

    const isStartup = profile.role === "startup";

    // 2. Fetch all activity metrics concurrently
    const [
        profileViewsRes,
        postsRes,
        decksRes,
        articlesRes
    ] = await Promise.all([
        supabase
            .from("profile_views")
            .select(`id, created_at, viewer:profiles!profile_views_viewer_id_fkey(id, nickname, company_name, role, username)`)
            .eq("profile_id", user.id)
            .order("created_at", { ascending: false }),

        supabase
            .from("posts")
            .select(`
        id, content, created_at,
        likes:likes(id),
        dislikes:dislikes(id),
        comments:comments(id)
      `)
            .eq("author_id", user.id)
            .order("created_at", { ascending: false }),

        isStartup
            ? supabase.from("pitch_decks").select("id, title, created_at").eq("user_id", user.id)
            : supabase.from("investor_bid_decks").select("id, title, created_at").eq("investor_id", user.id),

        supabase
            .from("articles")
            .select(`
        id, title, read_time, created_at,
        likes:article_likes(id),
        dislikes:article_dislikes(id)
      `)
            .eq("author_id", user.id)
            .order("created_at", { ascending: false })
    ]);

    const profileViews = profileViewsRes.data || [];
    const posts = postsRes.data || [];
    const decks = decksRes.data || [];
    const articles = articlesRes.data || [];

    const totalProfileViews = profileViews.length;
    const uniqueVisitors = new Set(profileViews.map((v: any) => v.viewer?.id).filter(Boolean)).size;

    const totalPostLikes = posts.reduce((acc: number, p: any) => acc + (p.likes?.length || 0), 0);
    const totalPostDislikes = posts.reduce((acc: number, p: any) => acc + (p.dislikes?.length || 0), 0);
    const totalPostComments = posts.reduce((acc: number, p: any) => acc + (p.comments?.length || 0), 0);

    const totalArticleLikes = articles.reduce((acc: number, a: any) => acc + (a.likes?.length || 0), 0);
    const totalArticleDislikes = articles.reduce((acc: number, a: any) => acc + (a.dislikes?.length || 0), 0);

    return (
        <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
            <Navbar />

            <main className="pt-32 pb-24 px-6 mx-auto max-w-[1400px] w-full relative z-10 space-y-10">

                {/* Header Navigation & Banner */}
                <div className="space-y-4">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--secondary)]/70 hover:text-[var(--accent)] transition-colors">
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>

                    <div className="neu-flat-base p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 rounded-3xl border border-[var(--secondary)]/10 shadow-2xl">
                        {/* Ambient background glow */}
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 right-10 p-8 text-[var(--secondary)] opacity-[0.03] pointer-events-none">
                            <BarChart3 size={240} />
                        </div>

                        <div className="relative z-10 space-y-3 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <span className="neu-pressed-base px-3.5 py-1.5 text-xs font-extrabold text-[var(--secondary)] flex items-center gap-2 rounded-full shadow-inner">
                                    <ShieldCheck size={14} className="text-[var(--accent)]" /> Platform Activity &amp; Reach
                                </span>
                                <BetaBadge variant="pill" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)] tracking-tight">
                                Unified <span className="text-[var(--accent)]">Analytics Hub</span>
                            </h1>
                            <p className="text-[var(--secondary)]/70 text-sm md:text-base leading-relaxed font-medium">
                                Monitor your network gravity, post engagement velocity, portfolio visibility, and research publication metrics in real-time.
                            </p>
                        </div>

                        <div className="relative z-10 flex flex-col gap-3 shrink-0">
                            <div className="neu-pressed-base p-4 rounded-2xl flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-[var(--secondary)]/50 block">Overall Engagement</span>
                                    <span className="text-xl font-black text-[var(--secondary)]">{totalProfileViews + totalPostLikes + totalArticleLikes} Interactions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Cumulative Metrics Grid (Interactive Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Card 1: Profile Views */}
                    <div className="neu-flat-base p-6 rounded-2xl space-y-4 relative group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--secondary)]/60">Profile Views</span>
                            <div className="neu-pressed-base p-3 text-[var(--accent)] rounded-xl shadow-inner group-hover:bg-[var(--accent)] group-hover:text-[var(--primary)] transition-colors"><Eye size={20} /></div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-[var(--secondary)] tracking-tight">{totalProfileViews}</h3>
                            <p className="text-xs font-semibold text-[var(--accent)] mt-1 flex items-center gap-1">
                                <Sparkles size={12} /> {uniqueVisitors} unique visitor{uniqueVisitors === 1 ? '' : 's'}
                            </p>
                        </div>
                        <div className="w-full bg-[var(--secondary)]/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[var(--accent)] h-full rounded-full" style={{ width: `${Math.min((uniqueVisitors / (totalProfileViews || 1)) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Card 2: Post Reactions */}
                    <div className="neu-flat-base p-6 rounded-2xl space-y-4 relative group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--secondary)]/60">Post Reactions</span>
                            <div className="neu-pressed-base p-3 text-[var(--accent)] rounded-xl shadow-inner group-hover:bg-[var(--accent)] group-hover:text-[var(--primary)] transition-colors"><ThumbsUp size={20} /></div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-[var(--secondary)] tracking-tight">{totalPostLikes}</h3>
                            <p className="text-xs font-semibold text-[var(--secondary)]/70 mt-1">
                                {totalPostDislikes} dislikes • {totalPostComments} comments
                            </p>
                        </div>
                        <div className="w-full bg-[var(--secondary)]/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((totalPostLikes / (totalPostLikes + totalPostDislikes + 1)) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Card 3: Active Decks */}
                    <div className="neu-flat-base p-6 rounded-2xl space-y-4 relative group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--secondary)]/60">Active Portfolios</span>
                            <div className="neu-pressed-base p-3 text-[var(--accent)] rounded-xl shadow-inner group-hover:bg-[var(--accent)] group-hover:text-[var(--primary)] transition-colors"><Presentation size={20} /></div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-[var(--secondary)] tracking-tight">{decks.length}</h3>
                            <p className="text-xs font-semibold text-[var(--accent)] mt-1">
                                {isStartup ? "Active Pitch Decks" : "Strategic Mandates"}
                            </p>
                        </div>
                        <div className="w-full bg-[var(--secondary)]/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[var(--accent)] h-full rounded-full w-full"></div>
                        </div>
                    </div>

                    {/* Card 4: Research Hub */}
                    <div className="neu-flat-base p-6 rounded-2xl space-y-4 relative group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--secondary)]/60">Research Hub</span>
                            <div className="neu-pressed-base p-3 text-[var(--accent)] rounded-xl shadow-inner group-hover:bg-[var(--accent)] group-hover:text-[var(--primary)] transition-colors"><FileText size={20} /></div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-black text-[var(--secondary)] tracking-tight">{articles.length}</h3>
                            <p className="text-xs font-semibold text-[var(--secondary)]/70 mt-1">
                                {totalArticleLikes} total research likes
                            </p>
                        </div>
                        <div className="w-full bg-[var(--secondary)]/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full w-3/4"></div>
                        </div>
                    </div>

                </div>

                {/* Detailed Breakdown Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* SECTION 1: Individual Posts Performance */}
                    <div className="neu-flat-base p-8 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4">
                            <h3 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                                <Activity size={20} className="text-[var(--accent)]" /> Individual Posts Performance
                            </h3>
                            <span className="neu-pressed-base px-3 py-1 text-xs font-bold text-[var(--accent)] rounded-full">{posts.length} Broadcasts</span>
                        </div>

                        {posts.length === 0 ? (
                            <div className="neu-pressed-base p-12 text-center space-y-3 rounded-2xl">
                                <Activity size={32} className="mx-auto text-[var(--secondary)]/30" />
                                <p className="text-sm font-bold text-[var(--secondary)]">No posts published yet.</p>
                                <p className="text-xs text-[var(--secondary)]/60">Broadcast insights on the Arena feed to track community reach.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
                                {posts.map((post: any) => (
                                    <div key={post.id} className="neu-pressed-base p-5 rounded-2xl space-y-3 transition-all hover:border-[var(--accent)]/30">
                                        <p className="text-xs text-[var(--secondary)] line-clamp-3 leading-relaxed font-medium">{post.content}</p>
                                        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--secondary)]/60 pt-3 border-t border-[var(--secondary)]/5">
                                            <span className="font-mono text-[10px]">{new Date(post.created_at).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg"><ThumbsUp size={12} /> {post.likes?.length || 0}</span>
                                                <span className="flex items-center gap-1.5 text-rose-500 bg-rose-500/10 px-2 py-1 rounded-lg"><ThumbsDown size={12} /> {post.dislikes?.length || 0}</span>
                                                <span className="flex items-center gap-1.5 text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg"><MessageSquare size={12} /> {post.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Profile Visitors Directory */}
                    <div className="neu-flat-base p-8 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4">
                            <h3 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                                <Users size={20} className="text-[var(--accent)]" /> Recent Profile Visitors
                            </h3>
                            <span className="neu-pressed-base px-3 py-1 text-xs font-bold text-[var(--accent)] rounded-full">{profileViews.length} Lookups</span>
                        </div>

                        {profileViews.length === 0 ? (
                            <div className="neu-pressed-base p-12 text-center space-y-3 rounded-2xl">
                                <Users size={32} className="mx-auto text-[var(--secondary)]/30" />
                                <p className="text-sm font-bold text-[var(--secondary)]">No profile visits recorded yet.</p>
                                <p className="text-xs text-[var(--secondary)]/60">Share your pitch deck or engage in discussions to attract visitors.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
                                {profileViews.map((viewItem: any) => {
                                    const viewer = viewItem.viewer;
                                    const viewerName = viewer?.nickname || viewer?.company_name || "Anonymous Member";
                                    const viewerRole = viewer?.role || "Member";
                                    const initials = viewerName.slice(0, 2).toUpperCase();

                                    return (
                                        <div key={viewItem.id} className="neu-pressed-base p-4 rounded-2xl flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="h-11 w-11 shrink-0 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] font-black text-xs flex items-center justify-center uppercase shadow-inner">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-[var(--secondary)]">{viewerName}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] font-extrabold text-[var(--accent)] capitalize px-2 py-0.5 rounded bg-[var(--accent)]/10">
                                                            {viewerRole}
                                                        </span>
                                                        <span className="text-[9px] text-[var(--secondary)]/50 font-mono">
                                                            {new Date(viewItem.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {viewer?.id && (
                                                <Link href={`/profile/${viewer.id}`} className="neu-btn px-4 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0">
                                                    Profile <ExternalLink size={12} />
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

                {/* SECTION 3: Decks & Research Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Decks Portfolio */}
                    <div className="neu-flat-base p-8 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4">
                            <h3 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                                <Presentation size={20} className="text-[var(--accent)]" /> {isStartup ? "Pitch Decks Portfolio" : "Strategic Capital Mandates"}
                            </h3>
                            <span className="neu-pressed-base px-3 py-1 text-xs font-bold text-[var(--accent)] rounded-full">{decks.length} Active</span>
                        </div>

                        {decks.length === 0 ? (
                            <div className="neu-pressed-base p-12 text-center rounded-2xl">
                                <p className="text-xs font-bold text-[var(--secondary)]">No active portfolios published.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {decks.map((deck: any) => (
                                    <div key={deck.id} className="neu-pressed-base p-4 rounded-2xl flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-[var(--secondary)]">{deck.title}</h4>
                                            <span className="text-[10px] text-[var(--secondary)]/50 font-mono">Created {new Date(deck.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <Link href={isStartup ? `/startup/${deck.id}/pitch` : `/bids/${deck.id}`} className="neu-btn px-4 py-2 text-xs font-bold">
                                            Inspect Room
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Research Articles */}
                    <div className="neu-flat-base p-8 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4">
                            <h3 className="text-lg font-bold text-[var(--secondary)] flex items-center gap-2">
                                <FileText size={20} className="text-[var(--accent)]" /> Research Articles &amp; Thesis Hub
                            </h3>
                            <span className="neu-pressed-base px-3 py-1 text-xs font-bold text-[var(--accent)] rounded-full">{articles.length} Published</span>
                        </div>

                        {articles.length === 0 ? (
                            <div className="neu-pressed-base p-12 text-center rounded-2xl">
                                <p className="text-xs font-bold text-[var(--secondary)]">No research articles published.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {articles.map((art: any) => (
                                    <div key={art.id} className="neu-pressed-base p-4 rounded-2xl flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-[var(--secondary)] line-clamp-1">{art.title}</h4>
                                            <div className="flex items-center gap-3 text-[10px] text-[var(--secondary)]/60 mt-1.5 font-medium">
                                                <span className="font-mono">{art.read_time}</span>
                                                <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">👍 {art.likes?.length || 0}</span>
                                                <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded font-bold">👎 {art.dislikes?.length || 0}</span>
                                            </div>
                                        </div>
                                        <Link href={`/research/${art.id}`} className="neu-btn px-4 py-2 text-xs font-bold">
                                            Read Article
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}