"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import StartupProfileCard, { Startup } from "@/components/directory/StartupProfileCard";
import BetaBadge from "@/components/shared/BetaBadge";
import { Search, SlidersHorizontal, Rocket, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function BrowseStartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");

  const industries = [
    "All", "SaaS", "FinTech", "HealthTech", "AI/ML", "Web3",
    "E-commerce", "DeepTech", "Technology", "CleanTech",
    "EdTech", "BioTech", "Logistics", "Consumer Goods"
  ];

  const stages = [
    "All", "Idea Stage", "Pre-Seed", "Seed", "Series A",
    "Series B", "Series C", "Growth/Expansion", "Pre-IPO"
  ];

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          startup_profiles (*),
          pitch_decks (id)
        `)
        .eq("role", "startup");

      if (data && !error) {
        const liveStartups: Startup[] = data.map((profile) => {
          const startupData = Array.isArray(profile.startup_profiles)
            ? profile.startup_profiles[0]
            : profile.startup_profiles;

          const activePitchDeck = Array.isArray(profile.pitch_decks) && profile.pitch_decks.length > 0
            ? profile.pitch_decks[0].id
            : null;

          return {
            id: profile.id,
            name: profile.company_name || profile.nickname || "Undisclosed Startup",
            tagline: profile.services_offering ? `${profile.services_offering} Company` : "Startup Profile",
            industry: profile.industry || startupData?.industry || "Technology",
            stage: "Early Stage",
            requiredFunding: profile.funding_goal || "Flexible",
            valuation: "TBD",
            location: profile.city ? `${profile.city}, ${profile.country || ""}` : "Global Network",
            teamSize: startupData?.company_size || "1-10",
            pitchSummary: profile.bio || profile.elevator_pitch || "No summary provided.",
            tags: [profile.industry, startupData?.target_exit].filter(Boolean) as string[],
            verified: profile.profile_completed || false,
            tier: (profile.tier as "freemium" | "gold" | "platinum") || "freemium",
            pitchDeckId: activePitchDeck,
          };
        });
        setStartups(liveStartups);
      }
      setLoading(false);
    }
    fetchProfiles();
  }, []);

  const filteredStartups = startups.filter((s) => {
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
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10">

        {/* Header */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl neu-pressed-base border-transparent text-[var(--accent)] shadow-inner">
              <Rocket size={24} />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                Public Directory
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)]">Browse Startups</h1>
            </div>
            <BetaBadge variant="pill" className="ml-auto hidden sm:inline-flex" />
          </div>

          <p className="text-[var(--secondary)]/70 text-sm max-w-2xl leading-relaxed font-medium">
            Window-shop high-growth startup profiles, funding asks, and valuation metrics. Connect directly with founders when you are ready to invest.
          </p>
        </div>

        {/* Main Search & Sidebar Layout */}
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Filter Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="neu-flat-base p-6 space-y-6">

              <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4">
                <h3 className="font-bold text-sm text-[var(--secondary)] flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[var(--accent)]" /> Filter Criteria
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[var(--secondary)]/50 hover:text-[var(--accent)] transition flex items-center gap-1 font-bold"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--secondary)]/70 uppercase tracking-wider block">
                  Industry Sector
                </label>
                <div className="space-y-1.5">
                  {industries.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setSelectedIndustry(ind)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${selectedIndustry === ind
                        ? "neu-pressed-base text-[var(--accent)] shadow-inner"
                        : "bg-transparent border border-transparent text-[var(--secondary)]/60 hover:text-[var(--secondary)] neu-btn shadow-none"
                        }`}
                    >
                      <span>{ind}</span>
                      {selectedIndustry === ind && <Check size={14} className="text-[var(--accent)]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Funding Stage */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--secondary)]/70 uppercase tracking-wider block">
                  Funding Stage
                </label>
                <div className="space-y-1.5">
                  {stages.map((stg) => (
                    <button
                      key={stg}
                      onClick={() => setSelectedStage(stg)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${selectedStage === stg
                        ? "neu-pressed-base text-[var(--accent)] shadow-inner"
                        : "bg-transparent border border-transparent text-[var(--secondary)]/60 hover:text-[var(--secondary)] neu-btn shadow-none"
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
              <Search size={18} className="absolute left-4 top-3.5 text-[var(--secondary)]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search startups by name, tech stack, industry, or pitch highlights..."
                className="w-full rounded-2xl border border-[var(--secondary)]/10 bg-[var(--primary)] py-3.5 pl-12 pr-4 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/50 focus:border-[var(--accent)] focus:outline-none transition shadow-inner font-medium"
              />
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-[var(--secondary)]/60 font-medium px-1">
              <span>Showing <strong className="text-[var(--secondary)]">{filteredStartups.length}</strong> startup cards</span>
              <span>Sorted by Most Recent</span>
            </div>

            {/* Cards Grid */}
            {loading ? (
              <div className="neu-flat-base p-12 text-center text-[var(--secondary)]/50 text-sm font-bold">
                Loading live startups network...
              </div>
            ) : filteredStartups.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredStartups.map((startup) => (
                  <StartupProfileCard key={startup.id} startup={startup} />
                ))}
              </div>
            ) : (
              <div className="neu-flat-base p-12 text-center space-y-4">
                <p className="text-[var(--secondary)]/60 text-sm font-medium">No startups match your current search and filter selection.</p>
                <button
                  onClick={resetFilters}
                  className="neu-btn px-5 py-2 text-xs"
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