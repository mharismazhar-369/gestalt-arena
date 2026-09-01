"use client";

import React from "react";
import { Briefcase, Globe, Target, MapPin, BadgeCheck, CheckCircle2 } from "lucide-react";
import type { InvestorProfile } from "@/types/schema";

export default function InvestorProfilePage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  // Mock data
  const profile: InvestorProfile = {
    profile_id: id,
    firm_name: "Apex Ventures",
    website: "https://apexventures-example.com",
    firm_type: "Venture Capital",
    assets_under_management: "$500M+",
    investment_thesis: "We back bold founders building category-defining companies in AI, Healthcare, and Sustainable Technologies. We look for highly technical teams solving hard engineering problems that have massive societal impact.",
    verification_status: "verified",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

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
                <h1 className="text-3xl font-bold">{profile.firm_name}</h1>
                {profile.verification_status === "verified" && (
                  <BadgeCheck className="w-6 h-6 text-blue-500" title="Verified Investor" />
                )}
              </div>
              <p className="text-lg text-muted-foreground">{profile.firm_type}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> Investment Thesis
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed">{profile.investment_thesis}</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">Investment Preferences</h2>
                <div className="space-y-4 bg-muted/20 p-6 rounded-xl border">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Preferred Stages</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-background border rounded-full text-sm font-medium">Pre-Seed</span>
                      <span className="px-3 py-1 bg-background border rounded-full text-sm font-medium">Seed</span>
                      <span className="px-3 py-1 bg-background border rounded-full text-sm font-medium">Series A</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Target Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-background border rounded-full text-sm font-medium">Artificial Intelligence</span>
                      <span className="px-3 py-1 bg-background border rounded-full text-sm font-medium">HealthTech</span>
                      <span className="px-3 py-1 bg-background border rounded-full text-sm font-medium">Climate Tech</span>
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
                  <p className="font-semibold">San Francisco, CA</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Globe className="w-4 h-4" /> <span className="text-sm font-medium">Website</span>
                  </div>
                  <p className="font-semibold text-primary hover:underline cursor-pointer">
                    apexventures-example.com
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Briefcase className="w-4 h-4" /> <span className="text-sm font-medium">AUM</span>
                  </div>
                  <p className="font-semibold">{profile.assets_under_management}</p>
                </div>
              </div>
              
              <div className="p-6 border rounded-xl bg-card shadow-sm">
                <h3 className="font-bold mb-4">Quick Facts</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Leads investments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Does follow-on funding</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Board seat usually required</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
