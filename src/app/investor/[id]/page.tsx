import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Briefcase, Globe, Target, MapPin, BadgeCheck, CheckCircle2, ArrowLeft } from "lucide-react";

export default async function InvestorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap the params Promise required by Next.js 15+
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch live data from the profiles table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "investor") // Ensure we only display investor profiles here
    .single();

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-[var(--secondary)]">Investor Not Found</h1>
            <p className="text-[var(--secondary)]/60 font-medium">This profile may have been removed or set to private.</p>
            <Link href="/feed" className="neu-btn px-6 py-2 mt-4 inline-block text-xs">Return to Feed</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Format UI Variables
  const displayName = profile.company_name || profile.nickname || "Undisclosed Investor";
  const displayLocation = profile.city ? `${profile.city}, ${profile.country || profile.state || ""}` : (profile.country || "Global Network");
  const displayTier = profile.tier ? `${profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)} Tier Investor` : "Investor Profile";
  const stages = profile.preferred_stages || [];
  const industries = profile.industries_of_interest || [];
  const thesis = profile.investment_thesis || profile.bio || "No investment thesis explicitly provided in this profile record.";

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-4 md:px-6 mx-auto max-w-5xl w-full relative z-10 space-y-8">

        {/* Back Navigation Link */}
        <div>
          <Link href="/feed" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--secondary)]/70 hover:text-[var(--accent)] transition">
            <ArrowLeft size={14} /> Back to Arena Feed
          </Link>
        </div>

        {/* Master Investor Header Card */}
        <div className="neu-flat-base p-8 md:p-12 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">

            {/* Avatar / Logo Box */}
            <div className="w-24 h-24 shrink-0 rounded-2xl neu-pressed-base border-transparent shadow-inner flex items-center justify-center text-[var(--accent)] font-black text-2xl uppercase overflow-hidden bg-[var(--secondary)]/5">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.slice(0, 2).toUpperCase()
              )}
            </div>

            <div className="flex-grow space-y-2">
              <div className="flex items-center gap-3">
                <span className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-[10px] font-bold uppercase text-[var(--accent)]">
                  {displayTier}
                </span>
                {profile.profile_completed && (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                    <BadgeCheck size={16} /> Verified Investor
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[var(--secondary)]">{displayName}</h1>
              <p className="text-sm text-[var(--secondary)]/70 font-medium">
                {profile.firm_details || profile.services_offering || "Capital Partner & Strategic Investor"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left Column: Thesis & Preferences (2 Cols) */}
          <div className="md:col-span-2 space-y-6">

            {/* Investment Thesis */}
            <div className="neu-flat-base p-8 space-y-4">
              <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                <Target size={16} className="text-[var(--accent)]" /> Investment Thesis
              </h2>
              <p className="text-sm text-[var(--secondary)]/80 leading-relaxed font-medium whitespace-pre-line">
                {thesis}
              </p>
            </div>

            {/* Preferences Box */}
            <div className="neu-flat-base p-8 space-y-6">
              <h2 className="text-sm font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                <Briefcase size={16} className="text-[var(--accent)]" /> Investment Preferences
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-[var(--secondary)]/60 uppercase tracking-wider mb-3">Preferred Stages</h3>
                  <div className="flex flex-wrap gap-2">
                    {stages.length > 0 ? (
                      stages.map((stage: string, i: number) => (
                        <span key={i} className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-xs font-bold text-[var(--secondary)]">
                          {stage}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-medium text-[var(--secondary)]/50 italic">Stage Agnostic</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[var(--secondary)]/60 uppercase tracking-wider mb-3">Target Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {industries.length > 0 ? (
                      industries.map((ind: string, i: number) => (
                        <span key={i} className="neu-pressed-base border-transparent shadow-inner px-3 py-1 rounded-full text-xs font-bold text-[var(--secondary)]">
                          {ind}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-medium text-[var(--secondary)]/50 italic">Sector Agnostic</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Quick Info Sidebar (1 Col) */}
          <div className="space-y-6">

            {/* Quick Details Card */}
            <div className="neu-flat-base p-6 space-y-5">
              <h3 className="text-xs font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-3">
                <Globe size={14} className="text-[var(--accent)]" /> Partner Details
              </h3>

              <div className="space-y-4 text-xs font-medium">
                <div>
                  <span className="text-[var(--secondary)]/60 uppercase tracking-wider block mb-1">Location</span>
                  <p className="font-bold text-[var(--secondary)] flex items-center gap-1.5">
                    <MapPin size={14} className="text-[var(--accent)]" /> {displayLocation}
                  </p>
                </div>

                {profile.website && (
                  <div>
                    <span className="text-[var(--secondary)]/60 uppercase tracking-wider block mb-1">Website</span>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--accent)] hover:underline truncate block">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                <div>
                  <span className="text-[var(--secondary)]/60 uppercase tracking-wider block mb-1">Target Ticket Size</span>
                  <p className="font-bold text-[var(--secondary)] font-mono text-sm">
                    {profile.ticket_size ? `$${Number(profile.ticket_size).toLocaleString()}` : "Flexible Allocation"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Facts Card */}
            <div className="neu-flat-base p-6 space-y-4">
              <h3 className="text-xs font-bold text-[var(--secondary)] border-b border-[var(--secondary)]/10 pb-3">
                Quick Facts
              </h3>
              <ul className="space-y-3 text-xs font-medium text-[var(--secondary)]/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Registered on Gestalt Arena</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Active Capital Partner</span>
                </li>
                {profile.profile_completed && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>Verified Background Check</span>
                  </li>
                )}
              </ul>
            </div>

          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}