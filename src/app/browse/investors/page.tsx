"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import InvestorProfileCard, { Investor } from "@/components/directory/InvestorProfileCard";
import BetaBadge from "@/components/shared/BetaBadge";
import { Search, Filter, Compass, SlidersHorizontal, Check, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function BrowseInvestorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [selectedRange, setSelectedRange] = useState<string>("All");

  const investmentTypes = ["All", "Angel", "Seed", "VC", "Private Equity", "Debt", "Revenue Share"];
  const stages = ["All", "Pre-Seed", "Seed", "Series A", "Series B+"];
  const ranges = ["All", "< $25k", "$25k - $100k", "$100k - $500k", "$500k+"];

  // Placeholder directory data array (structural)
  const initialInvestors: Investor[] = [
    {
      id: "inv-1",
      name: "Strategic Angel Syndicate",
      type: "Angel",
      description: "Early-stage software and deep-tech syndicate providing initial pre-seed and seed capital along with operator mentorship.",
      location: "United States",
      investmentRange: "$10,000 – $50,000",
      stageFocus: ["Pre-Seed", "Seed"],
      sectors: ["Fintech", "Developer Tools", "AI/ML"],
      portfolioCount: 18,
      tier: "platinum",
      verified: true,
    },
    {
      id: "inv-2",
      name: "Apex Frontier Capital",
      type: "VC",
      description: "Venture capital fund focused on Series A high-growth technology platforms, web infrastructure, and enterprise SaaS.",
      location: "Singapore",
      investmentRange: "$100,000 – $500,000",
      stageFocus: ["Seed", "Series A"],
      sectors: ["Enterprise SaaS", "Cybersecurity", "Cloud"],
      portfolioCount: 34,
      tier: "platinum",
      verified: true,
    },
    {
      id: "inv-3",
      name: "NextGen Founders Fund",
      type: "Seed",
      description: "Operator-led seed fund backing first-time founders building disruptive consumer platforms and AI workflow automation.",
      location: "United Kingdom",
      investmentRange: "$25,000 – $100,000",
      stageFocus: ["Seed"],
      sectors: ["Consumer Tech", "AI/ML", "HealthTech"],
      portfolioCount: 22,
      tier: "gold",
      verified: true,
    },
    {
      id: "inv-4",
      name: "Global Growth Equity",
      type: "Private Equity",
      description: "Growth capital partner providing non-dilutive and strategic growth equity to proven technology models with strong cash flows.",
      location: "United Arab Emirates",
      investmentRange: "$500,000+",
      stageFocus: ["Series B+"],
      sectors: ["Fintech", "Logistics", "E-Commerce"],
      portfolioCount: 45,
      tier: "gold",
      verified: true,
    },
    {
      id: "inv-5",
      name: "SaaS Revenue Capital",
      type: "Revenue Share",
      description: "Flexible revenue-based financing solution for recurring revenue SaaS companies without dilution or board seats.",
      location: "Canada",
      investmentRange: "$50,000 – $250,000",
      stageFocus: ["Seed", "Series A"],
      sectors: ["B2B SaaS", "Subscriptions"],
      portfolioCount: 15,
      tier: "freemium",
      verified: false,
    },
    {
      id: "inv-6",
      name: "Vanguard Tech Ventures",
      type: "VC",
      description: "Global early-stage VC firm investing in foundational AI research, robotics, and decentralized data protocols.",
      location: "Germany",
      investmentRange: "$100,000 – $500,000",
      stageFocus: ["Pre-Seed", "Seed"],
      sectors: ["DeepTech", "AI Research", "Web3"],
      portfolioCount: 29,
      tier: "platinum",
      verified: true,
    },
  ];

  // UI Filtering logic
  const filteredInvestors = initialInvestors.filter((inv) => {
    const matchesSearch =
      inv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.sectors?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === "All" || inv.type?.toLowerCase() === selectedType.toLowerCase();
    const matchesStage = selectedStage === "All" || inv.stageFocus?.includes(selectedStage);

    return matchesSearch && matchesType && matchesStage;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedStage("All");
    setSelectedRange("All");
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10">
        
        {/* Header Section */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Compass size={24} />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Public Directory
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white">Browse Investors</h1>
            </div>
            <BetaBadge variant="pill" className="ml-auto hidden sm:inline-flex" />
          </div>

          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Discover verified angel investors, venture capital funds, and strategic capital allocators. Filter by funding type, ticket size, and industry focus.
          </p>
        </div>

        {/* Main Search & Sidebar Layout */}
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Filter Sidebar (UI Only) */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-cyan-400" /> Filter Criteria
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-slate-400 hover:text-cyan-400 transition flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              {/* Investment Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Investment Type
                </label>
                <div className="space-y-1.5">
                  {investmentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                        selectedType === type
                          ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300"
                          : "bg-white/5 border border-transparent text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span>{type}</span>
                      {selectedType === type && <Check size={14} className="text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Stage */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Stage Focus
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {stages.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setSelectedStage(stage)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        selectedStage === stage
                          ? "bg-violet-500/20 border border-violet-400/50 text-violet-300"
                          : "bg-white/5 border border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket Size Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Ticket Size
                </label>
                <div className="space-y-1.5">
                  {ranges.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRange(r)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        selectedRange === r
                          ? "bg-amber-500/20 border border-amber-400/50 text-amber-300"
                          : "bg-white/5 border border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Directory Content & Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search Input Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search investors by name, sector (e.g. Fintech, SaaS), or description..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition backdrop-blur-xl"
              />
            </div>

            {/* Active Results Summary */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Showing <strong>{filteredInvestors.length}</strong> investor profiles</span>
              <span>Sorted by Relevance</span>
            </div>

            {/* Investor Cards Grid */}
            {filteredInvestors.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredInvestors.map((investor) => (
                  <InvestorProfileCard key={investor.id} investor={investor} />
                ))}
              </div>
            ) : (
              <div className="trionn-glass-card rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <p className="text-slate-400 text-sm">No investors match your current search and filter criteria.</p>
                <button
                  onClick={resetFilters}
                  className="rounded-xl bg-cyan-400 px-5 py-2 text-xs font-bold text-black hover:bg-cyan-300 transition"
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
