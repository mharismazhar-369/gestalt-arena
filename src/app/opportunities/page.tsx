"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, TrendingUp, DollarSign, Target, Briefcase } from "lucide-react";
import type { FundraisingOpportunity } from "@/types/schema";

// Mock data for initial UI before connecting to Supabase
const mockOpportunities: FundraisingOpportunity[] = [
  {
    id: "1",
    startup_id: "s1",
    title: "AI-Powered Healthcare Analytics",
    description: "Revolutionizing patient care with predictive analytics and machine learning.",
    funding_goal: 2000000,
    amount_raised: 500000,
    minimum_ticket: 50000,
    valuation: 10000000,
    equity_offered: 20,
    stage: "Seed",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    startup_id: "s2",
    title: "Sustainable Packaging Solutions",
    description: "Eco-friendly, biodegradable packaging for the e-commerce industry.",
    funding_goal: 5000000,
    amount_raised: 3000000,
    minimum_ticket: 100000,
    valuation: 25000000,
    equity_offered: 20,
    stage: "Series A",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<FundraisingOpportunity[]>(mockOpportunities);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOpps = opportunities.filter(opp => 
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (opp.description && opp.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Fundraising Opportunities</h1>
          <p className="text-muted-foreground text-lg">
            Discover and invest in high-growth startups curated for your portfolio.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search opportunities, industries, or keywords..." 
            className="w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors whitespace-nowrap font-medium">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpps.map((opp) => (
          <Link href={`/opportunities/${opp.id}`} key={opp.id} className="group h-full">
            <div className="bg-card border rounded-xl overflow-hidden h-full flex flex-col hover:shadow-md hover:border-primary/50 transition-all duration-300">
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {opp.stage || "Early Stage"}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {Math.round((opp.amount_raised / (opp.funding_goal || 1)) * 100)}% Funded
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {opp.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">
                  {opp.description}
                </p>

                <div className="space-y-3 pt-4 border-t mt-auto">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground gap-1.5">
                      <Target className="w-4 h-4" /> Goal
                    </span>
                    <span className="font-semibold">${(opp.funding_goal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground gap-1.5">
                      <DollarSign className="w-4 h-4" /> Min Ticket
                    </span>
                    <span className="font-semibold">${(opp.minimum_ticket || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-muted-foreground gap-1.5">
                      <TrendingUp className="w-4 h-4" /> Valuation
                    </span>
                    <span className="font-semibold">${(opp.valuation || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 px-6 py-4 border-t text-sm font-medium text-primary flex justify-center items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                View Opportunity
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
