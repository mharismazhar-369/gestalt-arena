import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import DeleteResourceButton from "@/components/shared/DeleteResourceButton";
import {
  Rocket, Compass, BookOpen, ShieldCheck, User, Sparkles,
  Folder, FileText, Radio, Presentation, Settings, MapPin,
  DollarSign, Building2, Briefcase, Plus, Eye, Edit3
} from "lucide-react";
import StartupProfileBuilder from "@/components/startup/StartupProfileBuilder";

export default async function StartupDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // 1. Fetch Core Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "investor") {
    redirect("/investor/dashboard");
  }

  if (!profile?.profile_completed) {
    return (
      <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
        <Navbar />
        <main className="pt-32 pb-24 px-6 mx-auto max-w-3xl w-full relative z-10 space-y-10">
          <StartupProfileBuilder profile={profile} />
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Fetch Extended Startup Details & Metrics
  const { data: startupProfile } = await supabase
    .from("startup_profiles")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  const { count: opportunitiesCount } = await supabase
    .from("fundraising_opportunities")
    .select("*", { count: "exact", head: true })
    .eq("startup_id", user.id);

  // Fetch full pitch decks array for management
  const { data: pitchDecks } = await supabase
    .from("pitch_decks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 3. Fetch User's Live Feed Activity
  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const displayName = profile?.nickname || profile?.company_name || startupProfile?.company_name || user.email?.split("@")[0] || "Founder Partner";
  const displayLocation = profile?.city ? `${profile.city}, ${profile.state || ""}` : "Global Network";
  const displayTier = profile?.tier || "freemium";
  const targetRaise = profile?.funding_goal ? `$${profile.funding_goal.toLocaleString()}` : "Flexible";
  const primarySector = profile?.industries_of_interest?.[0] || startupProfile?.industry || "Technology";

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-8">

        {/* Dynamic Header Banner */}
        <div className="trionn-glass-card rounded-3xl border border-violet-500/30 p-8 md:p-10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="absolute top-0 right-0 p-8 text-violet-500/10 pointer-events-none">
            <Rocket size={220} />
          </div>

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Founder Portal
              </span>
              <BetaBadge variant="pill" />
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent capitalize">
                {displayName}
              </span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Showcase your startup pitch card to active angel investors and VCs on Gestalt Arena without paywalls.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-3 min-w-[200px]">
            <Link
              href="/dashboard/preferences"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-400/50 transition text-sm font-bold text-white shadow-lg"
            >
              <Settings size={16} className="text-violet-400" /> Global Settings
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
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} className="text-cyan-400" /> Headquarters</span>
            <span className="text-lg font-black text-white truncate">{displayLocation}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><DollarSign size={12} className="text-emerald-400" /> Target Raise</span>
            <span className="text-lg font-black text-white">{targetRaise}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 backdrop-blur-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={12} className="text-amber-400" /> Primary Sector</span>
            <span className="text-lg font-black text-white truncate">{primarySector}</span>
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

        {/* Pitch Deck Portfolio Management Section */}
        <div className="trionn-glass-card rounded-3xl border border-violet-500/30 p-8 shadow-2xl relative overflow-hidden mt-8">
          <div className="absolute top-0 right-0 p-6 text-violet-500/5 pointer-events-none">
            <Presentation size={120} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 relative z-10 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Presentation size={20} className="text-violet-400" /> Deal Flow & Pitch Decks
              </h2>
              <p className="text-xs text-slate-400 mt-1">Manage your active pitch cards, preview live decks, and update fundraising metrics.</p>
            </div>

            <Link
              href="/startup/pitch/build"
              className="flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 hover:bg-violet-600 transition shrink-0"
            >
              <Plus size={16} /> Create Pitch Deck
            </Link>
          </div>

          <div className="pt-6 relative z-10">
            {pitchDecks && pitchDecks.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {pitchDecks.map((deck) => (
                  <div key={deck.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4 shadow-lg hover:border-violet-500/40 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {deck.stage || "Pre-Seed"}
                        </span>
                        <h3 className="font-bold text-white text-lg mt-2">{deck.title || "Untitled Pitch"}</h3>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        ${deck.funding_goal ? deck.funding_goal.toLocaleString() : "Flexible"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {deck.elevator_pitch || deck.description || "No elevator pitch provided."}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/startup/${deck.id}/pitch`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-cyan-300 border border-cyan-500/20 transition"
                        >
                          <Eye size={14} /> View
                        </Link>
                        <Link
                          href={`/startup/pitch/build?pitch_id=${deck.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-violet-300 border border-violet-500/20 transition"
                        >
                          <Edit3 size={14} /> Edit
                        </Link>
                      </div>

                      <DeleteResourceButton table="pitch_decks" recordId={deck.id} itemName="Pitch" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center space-y-3">
                <Presentation size={36} className="text-slate-500" />
                <div>
                  <p className="text-sm font-bold text-slate-300">No Pitch Decks Created Yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Create your master pitch deck to showcase your valuation, raise target, and traction metrics to investors.
                  </p>
                </div>
                <Link
                  href="/startup/pitch/build"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-violet-600 transition"
                >
                  <Plus size={16} /> Create Your First Deck
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Founder Metrics Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 flex items-center gap-4 shadow-xl">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Folder size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fundraising Opps</p>
              <h4 className="text-3xl font-black text-white">{opportunitiesCount || 0}</h4>
            </div>
          </div>

          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 flex items-center gap-4 shadow-xl">
            <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pitch Decks Created</p>
              <h4 className="text-3xl font-black text-white">{pitchDecks?.length || 0}</h4>
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
                <User size={18} className="text-cyan-400" /> Startup Profile Record
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 font-bold text-violet-300 capitalize text-xs mt-1">
                    <ShieldCheck size={12} /> {profile?.role || "startup"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Elevator Pitch</span>
                  <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                    {profile?.elevator_pitch || startupProfile?.description || profile?.bio || "No elevator pitch provided yet."}
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
          <div className="trionn-glass-card rounded-3xl border border-violet-500/30 p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-violet-500/5 pointer-events-none">
              <Radio size={120} />
            </div>

            <div className="flex items-center justify-between border-b border-violet-500/20 pb-4 relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio size={18} className="text-violet-400" /> My Recent Arena Posts
              </h3>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {!posts || posts.length === 0 ? (
                <p className="text-sm text-slate-400">You haven't broadcasted to the Arena Feed yet.</p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl border border-violet-500/10 bg-violet-500/[0.02] hover:bg-violet-500/[0.05] transition space-y-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold text-violet-300">
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