"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import InvestorProfileCard, { Investor } from "@/components/directory/InvestorProfileCard";
import BetaBadge from "@/components/shared/BetaBadge";
import { Search, SlidersHorizontal, Check, RefreshCw, Compass } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function BrowseInvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [selectedRange, setSelectedRange] = useState<string>("All");

  const investmentTypes = [
    "All", "Angel", "Pre-Seed", "Seed", "Venture Capital",
    "Corporate VC", "Private Equity", "Family Office",
    "Syndicate", "Debt", "Revenue Share", "Grant/Non-Dilutive"
  ];
  const stages = ["All", "Pre-Seed", "Seed", "Series A", "Series B+"];
  const ranges = ["All", "< $25k", "$25k - $100k", "$100k - $500k", "$500k+"];

  // Fetch live investors from Supabase
  useEffect(() => {
    async function fetchInvestors() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "investor")
        .eq("profile_completed", true);

      if (data && !error) {
        const liveInvestors: Investor[] = data.map((profile) => ({
          id: profile.id,
          name: profile.nickname || "Undisclosed Investor",
          type: "Angel", // Fallback, could be mapped to a specific DB field later
          description: profile.bio || profile.investment_thesis || "No description provided.",
          location: profile.city ? `${profile.city}, ${profile.state || ""}` : "Global Network",
          investmentRange: profile.ticket_size || "Flexible",
          stageFocus: profile.preferred_stages || [],
          sectors: profile.industries_of_interest || [],
          portfolioCount: 0,
          tier: "freemium",
          verified: profile.profile_completed,
        }));
        setInvestors(liveInvestors);
      }
      setLoading(false);
    }

    fetchInvestors();
  }, []);

  // UI Filtering logic applied to the dynamic state
  const filteredInvestors = investors.filter((inv) => {
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
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10">
        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl neu-pressed-base border-transparent text-[var(--accent)] shadow-inner">
              <Compass size={24} />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                Public Directory
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-[var(--secondary)]">Browse Investors</h1>
            </div>
            <BetaBadge variant="pill" className="ml-auto hidden sm:inline-flex" />
          </div>
          <p className="text-[var(--secondary)]/70 text-sm max-w-2xl leading-relaxed font-medium">
            Discover verified angel investors, venture capital funds, and strategic capital allocators.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <div className="neu-flat-base p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--secondary)]/10 pb-4">
                <h3 className="font-bold text-sm text-[var(--secondary)] flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[var(--accent)]" /> Filter Criteria
                </h3>
                <button onClick={resetFilters} className="text-[11px] text-[var(--secondary)]/50 hover:text-[var(--accent)] transition flex items-center gap-1 font-bold">
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              {/* Sidebar Filters */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--secondary)]/70 uppercase tracking-wider block">Investment Type</label>
                <div className="space-y-1.5">
                  {investmentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${selectedType === type
                          ? "neu-pressed-base text-[var(--accent)] shadow-inner"
                          : "bg-transparent border border-transparent text-[var(--secondary)]/60 hover:text-[var(--secondary)] neu-btn shadow-none"
                        }`}
                    >
                      <span>{type}</span>
                      {selectedType === type && <Check size={14} className="text-[var(--accent)]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-6">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-[var(--secondary)]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search investors..."
                className="w-full rounded-2xl border border-[var(--secondary)]/10 bg-[var(--primary)] py-3.5 pl-12 pr-4 text-sm text-[var(--secondary)] placeholder-[var(--secondary)]/50 focus:border-[var(--accent)] focus:outline-none transition shadow-inner font-medium"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--secondary)]/60 font-medium px-1">
              <span>Showing <strong className="text-[var(--secondary)]">{filteredInvestors.length}</strong> investor profiles</span>
            </div>

            {loading ? (
              <div className="neu-flat-base p-12 text-center text-[var(--secondary)]/50 text-sm font-bold">
                Loading live investor network...
              </div>
            ) : filteredInvestors.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredInvestors.map((investor) => (
                  <InvestorProfileCard key={investor.id} investor={investor} />
                ))}
              </div>
            ) : (
              <div className="neu-flat-base p-12 text-center space-y-4">
                <p className="text-[var(--secondary)]/60 text-sm font-medium">No investors match your criteria.</p>
                <button onClick={resetFilters} className="neu-btn px-5 py-2 text-xs">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}