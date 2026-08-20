import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import Link from "next/link";
import { ShieldCheck, User, Compass, Rocket, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch role from Supabase profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Role Routing Redirects
  if (profile?.role === "investor") {
    redirect("/investor/dashboard");
  } else if (profile?.role === "startup") {
    redirect("/startup/dashboard");
  } else if (profile?.role === "admin") {
    redirect("/admin/dashboard");
  }

  // Fallback UI if role is not yet specified in profiles table
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
        <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 md:p-12 space-y-8 shadow-2xl">
          
          <div className="border-b border-white/10 pb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-1">
                <Sparkles size={14} /> Profile Verification Required
              </div>
              <h1 className="text-3xl font-black text-white">Select Arena Role</h1>
            </div>
            <BetaBadge variant="pill" />
          </div>

          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>
              Your account (<strong className="text-white font-mono">{user.email}</strong>) is authenticated, but your profile role in the <code className="text-cyan-400 font-mono">profiles</code> table is pending setup.
            </p>
            <p>
              Please choose your primary platform role to complete routing:
            </p>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <Link
                href="/browse/investors"
                className="trionn-glass rounded-2xl border border-cyan-500/30 p-6 space-y-3 hover:border-cyan-400 transition group"
              >
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
                  <Compass size={24} />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300">Investor Account</h3>
                <p className="text-xs text-slate-400">Browse startups, review pitch decks, and allocate capital.</p>
              </Link>

              <Link
                href="/browse/startups"
                className="trionn-glass rounded-2xl border border-violet-500/30 p-6 space-y-3 hover:border-violet-400 transition group"
              >
                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 w-fit">
                  <Rocket size={24} />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-violet-300">Startup Founder</h3>
                <p className="text-xs text-slate-400">Publish pitch cards, connect with VCs, and track raises.</p>
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex items-center justify-between text-xs text-slate-400">
            <span>User ID: <code className="text-slate-300 font-mono">{user.id}</code></span>
            <LogoutButton />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}