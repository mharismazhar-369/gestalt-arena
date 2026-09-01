import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import { Compass, Rocket, BookOpen, ShieldCheck, User, Sparkles, Settings, MapPin, DollarSign, Building2, Briefcase } from "lucide-react";
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

  const displayName = profile?.nickname || profile?.company_name || user.email?.split("@")[0] || "Investor Partner";
  const displayLocation = profile?.city ? `${profile.city}, ${profile.state || ""}` : "Global Network";
  const displayTier = profile?.tier || "freemium";

  // STANDARD DASHBOARD VIEW
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

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
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
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Investment Thesis</span>
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                  {profile?.investment_thesis || profile?.bio || "No investment thesis explicitly provided in your database record yet."}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Supabase UUID</span>
                <p className="font-mono text-cyan-400/50 text-[10px] break-all">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}