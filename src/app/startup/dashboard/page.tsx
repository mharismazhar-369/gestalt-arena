import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import { Rocket, Compass, BookOpen, ShieldCheck, User, Sparkles, TrendingUp, DollarSign } from "lucide-react";

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