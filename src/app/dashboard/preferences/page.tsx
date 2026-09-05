"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useTheme } from "@/components/context/ThemeProvider";
import {
  Save, AlertCircle, User, Globe, Target, DollarSign,
  Briefcase, Activity, MapPin, Link as LinkIcon, Loader2, Rocket,
  Building, Hash
} from "lucide-react";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";

export default function GlobalPreferencesPage() {
  const { session } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // Expanded Global Profile State
  const [profile, setProfile] = useState({
    role: "investor",
    nickname: "",
    bio: "",
    gender: "",
    dob: "",
    company_name: "",
    ownership_type: "solo",
    services_offering: "products",
    industry: "",
    interested_in: "founders",
    interested_market: "global",
    city: "",
    state: "",
    country: "",
    timezone: "UTC",
    visibility: "public",
    linkedin_url: "",
    website_url: "",
  });

  // Expanded Investor Preferences
  const [investorPrefs, setInvestorPrefs] = useState({
    min_ticket: 50000,
    max_ticket: 500000,
    preferred_stages: [] as string[],
    industries: [] as string[],
    geographies: [] as string[],
    lead_investment: false,
    follow_on: false,
    risk_tolerance: "balanced",
    board_involvement: "observer",
    deal_velocity: "3-5",
    target_company_size: "1-10",
    target_operational_locations: "",
  });

  // Expanded Startup Preferences
  const [startupPrefs, setStartupPrefs] = useState({
    current_arr: 0,
    monthly_burn: 0,
    operational_costs: 0,
    runway_months: 12,
    technical_moat: "",
    target_exit: "acquisition",
    industry: "",
    company_size: "1-10",
    operational_locations: "",
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchSettings = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile({
          role: profileData.role || "investor",
          nickname: profileData.nickname || "",
          bio: profileData.bio || "",
          gender: profileData.gender || "",
          dob: profileData.dob || "",
          company_name: profileData.company_name || "",
          ownership_type: profileData.ownership_type || "solo",
          services_offering: profileData.services_offering || "products",
          industry: profileData.industry || "",
          interested_in: profileData.interested_in || "founders",
          interested_market: profileData.interested_market || "global",
          city: profileData.city || "",
          state: profileData.state || "",
          country: profileData.country || "",
          timezone: profileData.timezone || "UTC",
          visibility: profileData.visibility || "public",
          linkedin_url: profileData.linkedin_url || "",
          website_url: profileData.website_url || "",
        });

        if (profileData.role === "investor") {
          const { data: prefData } = await supabase
            .from("investor_preferences")
            .select("*")
            .eq("investor_id", session.user.id)
            .single();

          if (prefData) {
            setInvestorPrefs({
              ...investorPrefs,
              ...prefData,
            });
          }
        } else {
          const { data: startupData } = await supabase
            .from("startup_profiles")
            .select("*")
            .eq("profile_id", session.user.id)
            .single();

          if (startupData) {
            setStartupPrefs({
              ...startupPrefs,
              ...startupData,
            });
          }
        }
      }
      setLoading(false);
    };

    fetchSettings();
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setSaving(true);
    setMessage(null);

    try {
      const { role, ...profileUpdates } = profile;
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      if (profile.role === "investor") {
        const { error: prefError } = await supabase
          .from("investor_preferences")
          .upsert({
            investor_id: session.user.id,
            ...investorPrefs,
            updated_at: new Date().toISOString(),
          });
        if (prefError) throw prefError;
      } else {
        const { error: startupError } = await supabase
          .from("startup_profiles")
          .upsert({
            profile_id: session.user.id,
            ...startupPrefs,
            updated_at: new Date().toISOString(),
          });
        if (startupError) throw startupError;
      }

      setMessage({ type: "success", text: "Settings synchronized with AI routing engine." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save preferences." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const STAGE_OPTIONS = ["Pre-Seed", "Seed", "Series A", "Series B", "Growth"];
  const isStartup = profile.role === "startup";

  if (loading) return <RoleRoutingLoader message="Loading Platform Settings..." />;

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-5xl w-full relative z-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--secondary)] flex items-center gap-3">
            <Target className="text-[var(--accent)]" size={32} />
            Global Settings & AI Capabilities
          </h1>
          <p className="text-[var(--secondary)]/70 text-sm max-w-2xl leading-relaxed font-medium">
            Configure your identity and operational metrics. The AI routing engine matches founders and investors based on exact runway risks, deployment velocity, and sector alignment.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-rose-500/10 border-rose-500/30 text-rose-600"}`}>
            <AlertCircle size={18} /> {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">

          {/* SECTION 0: PLATFORM THEME */}
          <div className="neu-flat-base p-8 space-y-6 relative overflow-hidden mb-8">
            <h2 className="text-xl font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-4">
              <Target size={18} className="text-[var(--accent)]" /> Platform Aesthetic
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { id: "secure", name: "Rock-Solid Secure", desc: "Corporate grey & growth green." },
                { id: "innovator", name: "Corporate Innovator", desc: "Pure white & vibrant teal." },
                { id: "integrator", name: "Dynamic Integrator", desc: "Charcoal dark mode & orange." },
                { id: "holistic", name: "Intelligent Holistic", desc: "Soft off-white & premium purple." },
                { id: "humanistic", name: "Humanistic Tech", desc: "Warm white & deep raspberry." }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={`text-left p-4 rounded-xl border ${theme === t.id ? 'border-[var(--accent)] neu-pressed-base' : 'border-transparent neu-btn'}`}
                >
                  <span className="block font-bold text-[var(--secondary)] text-sm">{t.name}</span>
                  <span className="block text-[var(--secondary)]/70 text-xs mt-1 font-medium">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1: GLOBAL PROFILE */}
          <div className="neu-flat-base p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[var(--secondary)]/5 pointer-events-none">
              <User size={120} />
            </div>

            <h2 className="text-xl font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-4 relative z-10">
              <User size={18} className="text-[var(--accent)]" /> Identity & Public Profile
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {/* Core Identifiers */}
              <div className="space-y-2 lg:col-span-3 neu-pressed-base p-4 rounded-xl border border-[var(--secondary)]/5">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider block flex items-center gap-1">
                  <Hash size={12} /> System User ID (Read-Only)
                </label>
                <input
                  type="text"
                  value={session?.user?.id || ""}
                  disabled
                  className="w-full px-4 py-2 rounded-lg bg-[var(--primary)] text-xs text-[var(--secondary)]/50 font-mono cursor-not-allowed border border-[var(--secondary)]/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Display / Alias Name</label>
                <input
                  type="text"
                  value={profile.nickname}
                  onChange={e => setProfile({ ...profile, nickname: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                  placeholder="Official identifier"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Gender</label>
                <select
                  value={profile.gender}
                  onChange={e => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                >
                  <option value="">Select...</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Date of Birth (Age Verification)</label>
                <input
                  type="date"
                  value={profile.dob}
                  onChange={e => setProfile({ ...profile, dob: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                />
              </div>

              {/* Company & Services */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Company Name</label>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={e => setProfile({ ...profile, company_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                  placeholder="Legal Entity Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Ownership / Role Type</label>
                <select
                  value={profile.ownership_type}
                  onChange={e => setProfile({ ...profile, ownership_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                >
                  <option value="solo">Solo Founder</option>
                  <option value="co-founder">Co-Founder</option>
                  <option value="investor">Angel / VC Investor</option>
                  <option value="corporate">Corporate / Enterprise</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Service Offering Type</label>
                <select
                  value={profile.services_offering}
                  onChange={e => setProfile({ ...profile, services_offering: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                >
                  <option value="products">Digital / Physical Products</option>
                  <option value="services">B2B / B2C Services</option>
                  <option value="ideas">Pre-Product Ideas / Research</option>
                  <option value="hybrid">Hybrid (Product & Service)</option>
                </select>
              </div>

              {/* Networks & Interests */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Primary Industry</label>
                <select
                  value={profile.industry}
                  onChange={e => setProfile({ ...profile, industry: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                >
                  <option value="">Select Industry...</option>
                  <option value="SaaS">B2B SaaS</option>
                  <option value="FinTech">FinTech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="AI/ML">AI / Machine Learning</option>
                  <option value="Web3">Web3 / Crypto</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="DeepTech">DeepTech</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Interested In Connecting With</label>
                <select
                  value={profile.interested_in}
                  onChange={e => setProfile({ ...profile, interested_in: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                >
                  <option value="investors">Investors Only</option>
                  <option value="founders">Founders Only</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Target Market / Region</label>
                <select
                  value={profile.interested_market}
                  onChange={e => setProfile({ ...profile, interested_market: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                >
                  <option value="global">Global Markets</option>
                  <option value="north_america">North America</option>
                  <option value="europe">Europe</option>
                  <option value="asia_pacific">Asia Pacific</option>
                  <option value="mena">Middle East & North Africa (MENA)</option>
                  <option value="latam">Latin America</option>
                </select>
              </div>

              {/* Location Data */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Country</label>
                <select
                  value={profile.country}
                  onChange={e => setProfile({ ...profile, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                >
                  <option value="">Select Country...</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="India">India</option>
                  <option value="Germany">Germany</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="UAE">United Arab Emirates</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">State / Province</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={e => setProfile({ ...profile, state: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                  placeholder="e.g. California, Punjab"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">City / Hub</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={e => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                  placeholder="e.g. San Francisco, Lahore"
                />
              </div>

              <div className="space-y-2 lg:col-span-3">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Professional Biography / Elevator Pitch</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition resize-none shadow-inner"
                  placeholder="Describe your mandate, background, and what you bring to the table..."
                />
              </div>

              <div className="space-y-2 lg:col-span-1">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Profile Visibility</label>
                <select
                  value={profile.visibility}
                  onChange={e => setProfile({ ...profile, visibility: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                >
                  <option value="public">Public (Directory & Feed)</option>
                  <option value="private">Private (Direct Link Only)</option>
                </select>
              </div>

              <div className="space-y-2 lg:col-span-1">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider flex items-center gap-1"><LinkIcon size={12} /> LinkedIn URL</label>
                <input
                  type="url"
                  value={profile.linkedin_url}
                  onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-2 lg:col-span-1">
                <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider flex items-center gap-1"><LinkIcon size={12} /> Website / Product URL</label>
                <input
                  type="url"
                  value={profile.website_url}
                  onChange={e => setProfile({ ...profile, website_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DYNAMIC AI MATCHING MANDATE */}
          <div className="neu-flat-base p-8 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[var(--secondary)]/5 pointer-events-none">
              {isStartup ? <Rocket size={140} /> : <Target size={140} />}
            </div>

            <h2 className="text-xl font-bold text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-4 relative z-10">
              {isStartup ? <Rocket size={18} className="text-[var(--accent)]" /> : <Target size={18} className="text-[var(--accent)]" />}
              {isStartup ? "Startup AI Valuation & Matching Metrics" : "AI Deal-Flow Engine Parameters"}
            </h2>

            <div className="grid md:grid-cols-2 gap-8 relative z-10">

              {/* === STARTUP SPECIFIC UI === */}
              {isStartup ? (
                <>
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-[var(--secondary)]/80 uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--secondary)]/10 pb-2">
                      <Building size={14} className="text-[var(--accent)]" /> Operations & Scale
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">COMPANY SIZE (EMPLOYEES)</label>
                        <select
                          value={startupPrefs.company_size}
                          onChange={e => setStartupPrefs({ ...startupPrefs, company_size: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                        >
                          <option value="1-10">1 - 10</option>
                          <option value="11-50">11 - 50</option>
                          <option value="51-200">51 - 200</option>
                          <option value="201+">201+</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">OPERATIONAL LOCATIONS</label>
                        <input
                          type="text"
                          value={startupPrefs.operational_locations}
                          onChange={e => setStartupPrefs({ ...startupPrefs, operational_locations: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                          placeholder="e.g. US, UK, Remote"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">CURRENT ARR ($)</label>
                        <input
                          type="number"
                          value={startupPrefs.current_arr}
                          onChange={e => setStartupPrefs({ ...startupPrefs, current_arr: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">RUNWAY (MONTHS)</label>
                        <input
                          type="number"
                          value={startupPrefs.runway_months}
                          onChange={e => setStartupPrefs({ ...startupPrefs, runway_months: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">TOTAL MONTHLY BURN ($)</label>
                        <input
                          type="number"
                          value={startupPrefs.monthly_burn}
                          onChange={e => setStartupPrefs({ ...startupPrefs, monthly_burn: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">OPERATIONAL COSTS ($)</label>
                        <input
                          type="number"
                          value={startupPrefs.operational_costs}
                          onChange={e => setStartupPrefs({ ...startupPrefs, operational_costs: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner"
                          placeholder="Current Expenses"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-[var(--secondary)]/80 uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--secondary)]/10 pb-2">
                      <Briefcase size={14} className="text-[var(--accent)]" /> Strategy & Moat
                    </h3>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">TARGET EXIT STRATEGY</label>
                      <select
                        value={startupPrefs.target_exit}
                        onChange={e => setStartupPrefs({ ...startupPrefs, target_exit: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                      >
                        <option value="acquisition">Strategic Acquisition (M&A)</option>
                        <option value="ipo">IPO</option>
                        <option value="pe_buyout">Private Equity Buyout</option>
                        <option value="undecided">Undecided / Growth Focus</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">TECHNICAL MOAT SUMMARY</label>
                      <textarea
                        rows={6}
                        value={startupPrefs.technical_moat}
                        onChange={e => setStartupPrefs({ ...startupPrefs, technical_moat: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition resize-none shadow-inner"
                        placeholder="Proprietary models, network effects, patents..."
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* === INVESTOR SPECIFIC UI === */
                <>
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-[var(--secondary)]/80 uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--secondary)]/10 pb-2">
                      <DollarSign size={14} className="text-[var(--accent)]" /> Capital Deployment
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">MINIMUM TICKET ($)</label>
                        <input
                          type="number"
                          value={investorPrefs.min_ticket}
                          onChange={e => setInvestorPrefs({ ...investorPrefs, min_ticket: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">MAXIMUM TICKET ($)</label>
                        <input
                          type="number"
                          value={investorPrefs.max_ticket}
                          onChange={e => setInvestorPrefs({ ...investorPrefs, max_ticket: Number(e.target.value) })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">RISK TOLERANCE</label>
                        <select
                          value={investorPrefs.risk_tolerance}
                          onChange={e => setInvestorPrefs({ ...investorPrefs, risk_tolerance: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                        >
                          <option value="conservative">Conservative</option>
                          <option value="balanced">Balanced</option>
                          <option value="aggressive">Aggressive (Deep Tech)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">BOARD SEAT REQUIREMENT</label>
                        <select
                          value={investorPrefs.board_involvement}
                          onChange={e => setInvestorPrefs({ ...investorPrefs, board_involvement: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                        >
                          <option value="required">Required</option>
                          <option value="observer">Observer Only</option>
                          <option value="passive">Passive / None</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <label className="flex items-start gap-4 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-[var(--accent)]/30 transition neu-flat-base shadow-none">
                        <div className="mt-0.5">
                          <input
                            type="checkbox"
                            checked={investorPrefs.lead_investment}
                            onChange={e => setInvestorPrefs({ ...investorPrefs, lead_investment: e.target.checked })}
                            className="rounded w-4 h-4"
                          />
                        </div>
                        <div>
                          <span className="block font-bold text-[var(--secondary)] text-sm group-hover:text-[var(--accent)] transition">Willing to Lead Rounds</span>
                          <span className="text-xs text-[var(--secondary)]/70 font-medium">Comfortable pricing rounds and issuing term sheets.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-[var(--secondary)]/80 uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--secondary)]/10 pb-2">
                      <Building size={14} className="text-[var(--accent)]" /> AI Targeting & Scale
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">TARGET COMPANY SIZE</label>
                        <select
                          value={investorPrefs.target_company_size}
                          onChange={e => setInvestorPrefs({ ...investorPrefs, target_company_size: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                        >
                          <option value="1-10">1 - 10 Employees</option>
                          <option value="11-50">11 - 50 Employees</option>
                          <option value="51-200">51 - 200 Employees</option>
                          <option value="201+">201+ Employees</option>
                          <option value="agnostic">Agnostic</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">TARGET OPS LOCATIONS</label>
                        <input
                          type="text"
                          value={investorPrefs.target_operational_locations}
                          onChange={e => setInvestorPrefs({ ...investorPrefs, target_operational_locations: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                          placeholder="e.g. US, Remote"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">PREFERRED STAGES</label>
                      <div className="flex flex-wrap gap-2">
                        {STAGE_OPTIONS.map(stage => {
                          const isSelected = investorPrefs.preferred_stages.includes(stage);
                          return (
                            <button
                              key={stage}
                              type="button"
                              onClick={() => {
                                const newStages = isSelected
                                  ? investorPrefs.preferred_stages.filter(s => s !== stage)
                                  : [...investorPrefs.preferred_stages, stage];
                                setInvestorPrefs({ ...investorPrefs, preferred_stages: newStages });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${isSelected
                                ? 'border-[var(--accent)] text-[var(--accent)] neu-pressed-base'
                                : 'border-transparent text-[var(--secondary)]/70 hover:text-[var(--secondary)] neu-btn'
                                }`}
                            >
                              {stage}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 pb-10">
            <button
              type="submit"
              disabled={saving}
              className="neu-btn px-8 py-4 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {saving ? "Syncing to AI Engine..." : "Save Platform Settings"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}