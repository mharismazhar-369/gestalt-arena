"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import StartupProfileCard, { Startup } from "@/components/directory/StartupProfileCard";
import BetaBadge from "@/components/shared/BetaBadge";
import { Search, SlidersHorizontal, Rocket, Check, RefreshCw } from "lucide-react";

export default function BrowseStartupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");

  const industries = ["All", "Artificial Intelligence", "B2B SaaS", "Fintech", "HealthTech", "Web3", "CleanTech"];
  const stages = ["All", "Idea Stage", "Pre-Seed", "Seed Stage", "Series A"];

  // Placeholder directory data array (structural)
  const initialStartups: Startup[] = [
    {
      id: "startup-1",
      name: "NexusAI SDK",
      tagline: "Autonomous agent orchestrator for enterprise multi-cloud pipelines",
      industry: "Artificial Intelligence",
      stage: "Seed Stage",
      requiredFunding: "$250,000",
      valuation: "$3.5M Valuation",
      location: "San Francisco, CA",
      teamSize: 6,
      pitchSummary: "Developer platform enabling autonomous multi-agent orchestration across AWS, GCP, and Azure with zero-latency fallback routing.",
      tags: ["Agentic AI", "Developer Tools", "Cloud Architecture"],
      verified: true,
      tier: "platinum",
    },
    {
      id: "startup-2",
      name: "Solace Health",
      tagline: "AI-driven remote patient monitoring and diagnostic telemetry",
      industry: "HealthTech",
      stage: "Pre-Seed",
      requiredFunding: "$100,000",
      valuation: "$1.8M Valuation",
      location: "Boston, MA",
      teamSize: 4,
      pitchSummary: "Clinical-grade sensor fusion software providing continuous cardiac and metabolic telemetry directly to physician dashboards.",
      tags: ["HealthTech", "IoT Telemetry", "Medical AI"],
      verified: true,
      tier: "gold",
    },
    {
      id: "startup-3",
      name: "VoltGrid Clean Energy",
      tagline: "Distributed micro-grid energy balancing and battery optimization",
      industry: "CleanTech",
      stage: "Series A",
      requiredFunding: "$500,000",
      valuation: "$8.0M Valuation",
      location: "Berlin, Germany",
      teamSize: 12,
      pitchSummary: "Smart grid software reducing commercial battery degradation by 35% through predictive thermal AI models.",
      tags: ["CleanTech", "Energy Grid", "Sustainability"],
      verified: true,
      tier: "platinum",
    },
    {
      id: "startup-4",
      name: "AetherPay Protocol",
      tagline: "Cross-border algorithmic settlement and treasury management",
      industry: "Fintech",
      stage: "Seed Stage",
      requiredFunding: "$200,000",
      valuation: "$4.0M Valuation",
      location: "London, UK",
      teamSize: 8,
      pitchSummary: "Instant foreign exchange liquidity protocol reducing global settlement transaction fees for international B2B merchants.",
      tags: ["Fintech", "Cross-Border Pay", "Treasury"],
      verified: true,
      tier: "gold",
    },
    {
      id: "startup-5",
      name: "DataPulse Analytics",
      tagline: "Real-time user cohort segmentation and predictive churn engine",
      industry: "B2B SaaS",
      stage: "Pre-Seed",
      requiredFunding: "$50,000",
      valuation: "$1.2M Valuation",
      location: "Toronto, Canada",
      teamSize: 3,
      pitchSummary: "Lightweight analytics library providing instant churn prediction metrics for subscription-based mobile apps.",
      tags: ["Analytics", "B2B SaaS", "User Cohorts"],
      verified: false,
      tier: "freemium",
    },
    {
      id: "startup-6",
      name: "Krypton Cyber Security",
      tagline: "Post-quantum cryptographic key distribution for enterprise storage",
      industry: "B2B SaaS",
      stage: "Seed Stage",
      requiredFunding: "$300,000",
      valuation: "$5.0M Valuation",
      location: "Tel Aviv, Israel",
      teamSize: 7,
      pitchSummary: "Quantum-resistant data encryption middleware safeguarding cloud object storage against future decryption vectors.",
      tags: ["Cybersecurity", "Post-Quantum", "Encryption"],
      verified: true,
      tier: "platinum",
    },
  ];

  // UI Filtering
  const filteredStartups = initialStartups.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pitchSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesIndustry = selectedIndustry === "All" || s.industry?.toLowerCase() === selectedIndustry.toLowerCase();
    const matchesStage = selectedStage === "All" || s.stage?.toLowerCase() === selectedStage.toLowerCase();

    return matchesSearch && matchesIndustry && matchesStage;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedIndustry("All");
    setSelectedStage("All");
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10">
        
        {/* Header */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-400/30 text-violet-400">
              <Rocket size={24} />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                Public Directory
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white">Browse Startups</h1>
            </div>
            <BetaBadge variant="pill" className="ml-auto hidden sm:inline-flex" />
          </div>

          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Window-shop high-growth startup pitch cards, funding asks, and valuation metrics. Connect directly with founders when you are ready to invest.
          </p>
        </div>

        {/* Main Search & Sidebar Layout */}
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Filter Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-violet-400" /> Filter Criteria
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-slate-400 hover:text-violet-400 transition flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Industry Sector
                </label>
                <div className="space-y-1.5">
                  {industries.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setSelectedIndustry(ind)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                        selectedIndustry === ind
                          ? "bg-violet-500/20 border border-violet-400/50 text-violet-300"
                          : "bg-white/5 border border-transparent text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span>{ind}</span>
                      {selectedIndustry === ind && <Check size={14} className="text-violet-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Funding Stage */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Funding Stage
                </label>
                <div className="space-y-1.5">
                  {stages.map((stg) => (
                    <button
                      key={stg}
                      onClick={() => setSelectedStage(stg)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        selectedStage === stg
                          ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300"
                          : "bg-white/5 border border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Startups Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search startups by name, tech stack, industry, or pitch highlights..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 transition backdrop-blur-xl"
              />
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Showing <strong>{filteredStartups.length}</strong> startup cards</span>
              <span>Sorted by Valuation</span>
            </div>

            {/* Cards Grid */}
            {filteredStartups.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredStartups.map((startup) => (
                  <StartupProfileCard key={startup.id} startup={startup} />
                ))}
              </div>
            ) : (
              <div className="trionn-glass-card rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <p className="text-slate-400 text-sm">No startups match your current search and filter selection.</p>
                <button
                  onClick={resetFilters}
                  className="rounded-xl bg-violet-400 px-5 py-2 text-xs font-bold text-black hover:bg-violet-300 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
