import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import {
  Rocket, Compass, BookOpen, ShieldCheck, User, Sparkles,
  Folder, FileText, Activity, MessageSquare, Radio
} from "lucide-react";

export default async function StartupDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Query real user profile from Supabase profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch aggregate counts for projects and pitch decks
  const { count: projectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: pitchDecksCount } = await supabase
    .from("pitch_decks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch standard user posts
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      content,
      created_at,
      post_activities (
        id,
        activity_type,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch user's live Arena Feed activity
  const { data: arenaFeedActivities } = await supabase
    .from("arena_feed")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-10">

        {/* Header Banner */}
        <div className="trionn-glass-card rounded-3xl border border-violet-500/30 p-8 md:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 text-violet-500/10 pointer-events-none">
            <Rocket size={220} />
          </div>

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Founder Portal
              </span>
              <BetaBadge variant="pill" />
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                {profile?.nickname || user.email?.split("@")[0] || "Founder Partner"}
              </span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Showcase your startup pitch card to active angel investors and VCs on Gestalt Arena without paywalls.
            </p>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/browse/investors"
            className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-4 hover:border-violet-400/50 transition group shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Compass size={24} />
              </div>
              <span className="text-xs text-violet-400 font-bold group-hover:underline">Browse →</span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-violet-300">Browse Investor Directory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find angel investors and venture funds matching your funding stage and industry sector.
            </p>
          </Link>

          <Link
            href="/research"
            className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-4 hover:border-pink-400/50 transition group shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <BookOpen size={24} />
              </div>
              <span className="text-xs text-pink-400 font-bold group-hover:underline">Publish →</span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Publish Product Updates</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Publish technical research, product milestones, and metrics in the Research Hub.
            </p>
          </Link>

          <Link
            href="/pricing"
            className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-4 hover:border-cyan-400/50 transition group shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles size={24} />
              </div>
              <span className="text-xs text-cyan-400 font-bold group-hover:underline">Tier Caps →</span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300">Founder Tier & Post Limits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Check daily post caps, character limits, and article publishing capabilities.
            </p>
          </Link>
        </div>

        {/* Founder Metrics Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 flex items-center gap-4 shadow-xl">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Folder size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Projects</p>
              <h4 className="text-3xl font-black text-white">{projectsCount || 0}</h4>
            </div>
          </div>

          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 flex items-center gap-4 shadow-xl">
            <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pitch Decks Created</p>
              <h4 className="text-3xl font-black text-white">{pitchDecksCount || 0}</h4>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Posts Card */}
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-cyan-400" /> Standard Posts
              </h3>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {!posts || posts.length === 0 ? (
                <p className="text-sm text-slate-400">No standard posts created yet.</p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-bold text-md">{post.title || "Untitled"}</h4>
                      <span className="text-[10px] text-slate-500">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{post.content}</p>
                    <div className="pt-2 flex flex-wrap gap-2 border-t border-white/5">
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                        <Activity size={10} className="text-pink-400" />
                        {post.post_activities?.length || 0} Interactions
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Arena Feed Activity Card */}
          <div className="trionn-glass-card rounded-3xl border border-violet-500/30 p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-violet-500/5 pointer-events-none">
              <Radio size={120} />
            </div>

            <div className="flex items-center justify-between border-b border-violet-500/20 pb-4 relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio size={18} className="text-violet-400 animate-pulse" /> Live Arena Feed
              </h3>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {!arenaFeedActivities || arenaFeedActivities.length === 0 ? (
                <p className="text-sm text-slate-400">No activity on the Arena Feed yet.</p>
              ) : (
                arenaFeedActivities.map((activity) => (
                  <div key={activity.id} className="p-4 rounded-2xl border border-violet-500/10 bg-violet-500/[0.02] hover:bg-violet-500/[0.05] transition space-y-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                        Broadcast
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(activity.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200">{activity.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Real User Profile Card */}
        <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User size={18} className="text-violet-400" /> Authenticated Profile Credentials
            </h3>
            <LogoutButton />
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">User Account Email</span>
              <p className="font-mono text-white text-sm">{user.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Supabase User ID</span>
              <p className="font-mono text-violet-300 text-xs break-all">{user.id}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Profiles Table Role</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 font-bold text-violet-300 capitalize">
                <ShieldCheck size={12} /> {profile?.role || "startup"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Location Metadata</span>
              <p className="text-white font-semibold">{profile?.city ? `${profile.city}, ${profile.state || ""}` : "Global Network"}</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}