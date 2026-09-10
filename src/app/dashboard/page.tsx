export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import RoleSelector from "@/components/dashboard/RoleSelector";
import { Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, presence_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.presence_status === "banned" || profile?.presence_status === "suspended") {
    redirect("/warning");
  }

  const userRole = (profile?.role || "").toLowerCase().trim();

  if (userRole === "investor") {
    redirect("/investor/dashboard");
  } else if (userRole === "startup") {
    redirect("/startup/dashboard");
  } else if (userRole === "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10">
        <div className="neu-flat-base rounded-3xl p-8 md:p-12 space-y-8 relative overflow-hidden">

          <div className="border-b border-[var(--secondary)]/10 pb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-xs uppercase tracking-widest mb-1">
                <Sparkles size={14} /> Profile Verification Required
              </div>
              <h1 className="text-3xl font-black text-[var(--secondary)]">Select Arena Role</h1>
            </div>
            <BetaBadge variant="pill" />
          </div>

          <div className="space-y-4 text-[var(--secondary)]/80 text-sm leading-relaxed">
            <p>
              Your account (<strong className="font-mono text-[var(--secondary)]">{user.email}</strong>) is authenticated, but your profile role is pending setup.
            </p>
            <p>
              Please choose your primary platform role to complete routing:
            </p>

            <RoleSelector userId={user.id} />

          </div>

          <div className="border-t border-[var(--secondary)]/10 pt-6 flex items-center justify-between text-xs text-[var(--secondary)]/60">
            <span>User ID: <code className="font-mono">{user.id}</code></span>
            <LogoutButton />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}