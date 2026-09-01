"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building, Target, DollarSign, PieChart, Users, FileText, CheckCircle2 } from "lucide-react";
import type { FundraisingOpportunity } from "@/types/schema";

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  // Unwrapping params is necessary in Next 15, but for typical client components React.use() might be needed for promises.
  // Using basic extraction here for now.
  const id = params.id;
  
  // Mock data for the specific opportunity
  const opp: FundraisingOpportunity = {
    id: id,
    startup_id: "s1",
    title: "AI-Powered Healthcare Analytics",
    description: "Revolutionizing patient care with predictive analytics and machine learning. We are building the next generation of healthcare data infrastructure to help hospitals predict patient outcomes, optimize resource allocation, and reduce readmission rates. Our proprietary algorithms have been trained on over 50 million anonymized patient records and have shown a 23% improvement in early detection of sepsis compared to current industry standards.",
    funding_goal: 2000000,
    amount_raised: 500000,
    minimum_ticket: 50000,
    valuation: 10000000,
    equity_offered: 20,
    stage: "Seed",
    status: "active",
    use_of_funds: "40% R&D and ML team expansion, 30% Go-to-market and sales, 20% Regulatory compliance, 10% Operations",
    traction_summary: "3 pilot programs with Tier-1 hospitals, $15k MRR, HIPAA compliant infrastructure.",
    revenue: 15000,
    burn_rate: 45000,
    runway_months: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const progressPercentage = Math.round((opp.amount_raised / (opp.funding_goal || 1)) * 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/opportunities" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Opportunities
      </Link>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="p-8 md:p-10 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {opp.stage}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{opp.title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                {opp.description}
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
              <button className="w-full md:w-48 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-all">
                Express Interest
              </button>
              <button className="w-full md:w-48 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" /> Pitch Deck
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-b bg-muted/10">
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Target Raise</p>
            <p className="text-2xl font-bold">${(opp.funding_goal || 0).toLocaleString()}</p>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Pre-Money Valuation</p>
            <p className="text-2xl font-bold">${(opp.valuation || 0).toLocaleString()}</p>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Min. Ticket Size</p>
            <p className="text-2xl font-bold">${(opp.minimum_ticket || 0).toLocaleString()}</p>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Equity Offered</p>
            <p className="text-2xl font-bold">{opp.equity_offered}%</p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h3 className="text-lg font-semibold mb-4">Funding Progress</h3>
          <div className="mb-2 flex justify-between text-sm font-medium">
            <span className="text-primary">${opp.amount_raised.toLocaleString()} raised</span>
            <span className="text-muted-foreground">{progressPercentage}% of ${(opp.funding_goal || 0).toLocaleString()}</span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-in-out" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Target className="w-6 h-6 text-primary" /> Traction & Metrics
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {opp.traction_summary}
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-muted/30 p-4 rounded-xl border">
                <p className="text-sm text-muted-foreground mb-1">Current MRR</p>
                <p className="text-xl font-semibold">${(opp.revenue || 0).toLocaleString()}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl border">
                <p className="text-sm text-muted-foreground mb-1">Monthly Burn</p>
                <p className="text-xl font-semibold">${(opp.burn_rate || 0).toLocaleString()}</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl border">
                <p className="text-sm text-muted-foreground mb-1">Runway</p>
                <p className="text-xl font-semibold">{opp.runway_months} months</p>
              </div>
            </div>
          </section>

          <section className="bg-card border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <PieChart className="w-6 h-6 text-primary" /> Use of Funds
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {opp.use_of_funds}
            </p>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Building className="w-5 h-5 text-primary" /> Company Profile
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-medium">HealthTech, AI</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Headquarters</p>
                <p className="font-medium">San Francisco, CA</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Founded</p>
                <p className="font-medium">2023</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="font-medium">11-50 employees</p>
              </div>
              <div className="pt-4 mt-4 border-t">
                <Link href={`/startup/${opp.startup_id}`} className="text-primary font-medium hover:underline flex items-center text-sm">
                  View full startup profile &rarr;
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
