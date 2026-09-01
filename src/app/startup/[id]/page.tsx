"use client";

import React from "react";
import Link from "next/link";
import { Building2, Globe, Users, TrendingUp, MapPin, BadgeCheck, ExternalLink } from "lucide-react";
import type { StartupProfile } from "@/types/schema";

export default function StartupProfilePage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  // Mock data
  const profile: StartupProfile = {
    profile_id: id,
    company_name: "HealthAI Diagnostics",
    website: "https://healthai-example.com",
    industry: "HealthTech",
    founded_year: 2022,
    employee_count: "11-50",
    business_model: "B2B SaaS",
    headquarters: "Boston, MA",
    description: "Building the next generation of predictive diagnostic tools for medical professionals. Our AI-driven platform analyzes patient history, lab results, and genetic markers to identify potential health risks before they become critical.",
    verification_status: "verified",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5"></div>
        
        <div className="px-8 pb-8 -mt-12">
          {/* Logo & Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
            <div className="w-24 h-24 bg-background border-4 border-background rounded-xl shadow-sm flex items-center justify-center shrink-0 overflow-hidden bg-muted">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold">{profile.company_name}</h1>
                {profile.verification_status === "verified" && (
                  <BadgeCheck className="w-6 h-6 text-blue-500" title="Verified Startup" />
                )}
              </div>
              <p className="text-lg text-muted-foreground">{profile.industry} &middot; {profile.business_model}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/opportunities/1" className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap">
                View Pitch
              </Link>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-10">
            <p className="text-lg leading-relaxed">{profile.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-b mb-8">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" /> <span className="text-sm font-medium">Headquarters</span>
              </div>
              <p className="font-semibold">{profile.headquarters}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" /> <span className="text-sm font-medium">Company Size</span>
              </div>
              <p className="font-semibold">{profile.employee_count}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" /> <span className="text-sm font-medium">Founded</span>
              </div>
              <p className="font-semibold">{profile.founded_year}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Globe className="w-4 h-4" /> <span className="text-sm font-medium">Website</span>
              </div>
              {profile.website ? (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline flex items-center gap-1">
                  Visit site <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-muted-foreground">Not provided</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Active Fundraising</h3>
            <Link href="/opportunities/1" className="block border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all group bg-muted/20">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg group-hover:text-primary transition-colors">Seed Round: AI-Powered Healthcare Analytics</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Seed
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">Raising $2,000,000 to expand our engineering team and launch pilot programs with 3 major hospital networks.</p>
              <div className="flex items-center text-sm font-medium text-primary">
                View Opportunity Details &rarr;
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
