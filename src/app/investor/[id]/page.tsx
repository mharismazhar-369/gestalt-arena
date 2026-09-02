import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Briefcase, Globe, Target, MapPin, BadgeCheck, CheckCircle2 } from "lucide-react";

export default async function InvestorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap the params Promise required by Next.js 15+
  const { id } = await params;

  const supabase = await createClient();

  // 2. Fetch live data from the profiles table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "investor") // Ensure we only display investor profiles here
    .single();

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Investor Not Found</h1>
        <p className="text-slate-400">This profile may have been removed or set to private.</p>
      </div>
    );
  }

  // 3. Format UI Variables
  const displayName = profile.company_name || profile.nickname || "Undisclosed Investor";
  const displayLocation = profile.city ? `${profile.city}, ${profile.country || profile.state || ""}` : "Global Network";
  const displayTier = profile.tier ? `${profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)} Tier Investor` : "Investor Profile";
  const stages = profile.preferred_stages || [];
  const industries = profile.industries_of_interest || [];
  const thesis = profile.investment_thesis || profile.bio || "No investment thesis explicitly provided in this profile record.";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-secondary/50 to-secondary/10"></div>

        <div className="px-8 pb-8 -mt-12">
          {/* Logo & Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
            <div className="w-24 h-24 bg-background border-4 border-background rounded-xl shadow-sm flex items-center justify-center shrink-0 overflow-hidden bg-muted">
              <Briefcase className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                {profile.profile_completed && (
                  <BadgeCheck className="w-6 h-6 text-blue-500" aria-label="Verified Investor" />
                )}
              </div>
              <p className="text-lg text-muted-foreground">{displayTier}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> Investment Thesis
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed">{thesis}</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">Investment Preferences</h2>
                <div className="space-y-4 bg-muted/20 p-6 rounded-xl border">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Preferred Stages</h3>
                    <div className="flex flex-wrap gap-2">
                      {stages.length > 0 ? (
                        stages.map((stage: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-background border rounded-full text-sm font-medium">
                            {stage}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground italic">Stage Agnostic</span>
                      )}
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Target Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {industries.length > 0 ? (
                        industries.map((ind: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-background border rounded-full text-sm font-medium">
                            {ind}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground italic">Sector Agnostic</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-muted/30 p-6 rounded-xl border space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" /> <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="font-semibold">{displayLocation}</p>
                </div>

                {profile.website && (
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Globe className="w-4 h-4" /> <span className="text-sm font-medium">Website</span>
                    </div>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline truncate block">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Briefcase className="w-4 h-4" /> <span className="text-sm font-medium">Target Ticket Size</span>
                  </div>
                  <p className="font-semibold">{profile.ticket_size || "Flexible"}</p>
                </div>
              </div>

              <div className="p-6 border rounded-xl bg-card shadow-sm">
                <h3 className="font-bold mb-4">Quick Facts</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Registered on Gestalt Arena</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Active Platform Member</span>
                  </li>
                  {profile.profile_completed && (
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>Verified Background Check</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}