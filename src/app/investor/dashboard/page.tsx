import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import { Compass, Rocket, BookOpen, ShieldCheck, User, Sparkles } from "lucide-react";
import InvestorProfileBuilder from "@/components/investor/InvestorProfileBuilder";

export default async function InvestorDashboardPage() {
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

  // Redirect non-investors attempting to access this route
  if (profile?.role === "startup") {
    redirect("/startup/dashboard");
  }

  // INTERCEPTOR: If profile is not completed, show the dedicated builder
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

  // STANDARD DASHBOARD VIEW (Only visible after profile completion)
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-10">

        {/* Header Banner */}
        <div className="trionn-glass-card rounded-3xl border border-cyan-500/30 p-8 md:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 text-cyan-500/10 pointer-events-none">
            <Compass size={220} />
          </div>

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Investor Portal
              </span>
              <BetaBadge variant="pill" />
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                {profile?.nickname || user.email?.split("@")[0] || "Investor Partner"}
              </span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Window-shop verified early-stage startups, track deal flows, and evaluate pitch cards across deep-tech, AI, and SaaS sectors.
            </p>
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

        {/* Real User Profile Card */}
        <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User size={18} className="text-cyan-400" /> Authenticated Profile Credentials
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
              <p className="font-mono text-cyan-300 text-xs break-all">{user.id}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Profiles Table Role</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 font-bold text-cyan-300 capitalize">
                <ShieldCheck size={12} /> {profile?.role || "investor"}
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