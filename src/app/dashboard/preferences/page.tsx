"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Save, AlertCircle, User, Globe, Target, DollarSign,
  Briefcase, Activity, MapPin, Link as LinkIcon, Loader2, Rocket
} from "lucide-react";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";

export default function GlobalPreferencesPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [profile, setProfile] = useState({
    role: "investor",
    nickname: "",
    bio: "",
    city: "",
    country: "",
    timezone: "UTC",
    visibility: "public",
    linkedin_url: "",
  });

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
  });

  const [startupPrefs, setStartupPrefs] = useState({
    current_arr: 0,
    monthly_burn: 0,
    runway_months: 12,
    technical_moat: "",
    target_exit: "acquisition",
    industry: "",
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchSettings = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role, nickname, bio, city, country, timezone, visibility, linkedin_url")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile({
          role: profileData.role || "investor",
          nickname: profileData.nickname || "",
          bio: profileData.bio || "",
          city: profileData.city || "",
          country: profileData.country || "",
          timezone: profileData.timezone || "UTC",
          visibility: profileData.visibility || "public",
          linkedin_url: profileData.linkedin_url || "",
        });

        if (profileData.role === "investor") {
          const { data: prefData } = await supabase
            .from("investor_preferences")
            .select("*")
            .eq("investor_id", session.user.id)
            .single();

          if (prefData) {
            setInvestorPrefs({
              min_ticket: prefData.min_ticket || 50000,
              max_ticket: prefData.max_ticket || 500000,
              preferred_stages: prefData.preferred_stages || [],
              industries: prefData.industries || [],
              geographies: prefData.geographies || [],
              lead_investment: prefData.lead_investment || false,
              follow_on: prefData.follow_on || false,
              risk_tolerance: prefData.risk_tolerance || "balanced",
              board_involvement: prefData.board_involvement || "observer",
              deal_velocity: prefData.deal_velocity || "3-5",
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
              current_arr: startupData.current_arr || 0,
              monthly_burn: startupData.monthly_burn || 0,
              runway_months: startupData.runway_months || 12,
              technical_moat: startupData.technical_moat || "",
              target_exit: startupData.target_exit || "acquisition",
              industry: startupData.industry || "",
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
  const themeColor = isStartup ? "violet" : "cyan";

  if (loading) return <RoleRoutingLoader message="Loading Platform Settings..." />;

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-5xl w-full relative z-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <Target className={`text-${themeColor}-400`} size={32} />
            Global Settings & AI Capabilities
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Configure your identity and operational metrics. The AI routing engine matches founders and investors based on exact runway risks, deployment velocity, and sector alignment.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border shadow-xl ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}>
            <AlertCircle size={18} /> {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">

          {/* SECTION 1: GLOBAL PROFILE */}
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-white/5 pointer-events-none">
              <User size={120} />
            </div>

            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4 relative z-10">
              <User size={18} className={`text-${themeColor}-400`} /> Identity & Public Profile
            </h2>

            <div className="grid md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {isStartup ? "Company Name / Founder Alias" : "Display Name"}
                </label>
                <input
                  type="text"
                  value={profile.nickname}
                  onChange={e => setProfile({ ...profile, nickname: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition`}
                  placeholder="Official identifier"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Profile Visibility</label>
                <select
                  value={profile.visibility}
                  onChange={e => setProfile({ ...profile, visibility: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition appearance-none`}
                >
                  <option value="public">Public (Visible in Directory & Feed)</option>
                  <option value="private">Private (Stealth Mode / Direct Link Only)</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Professional Biography / Elevator Pitch</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition resize-none`}
                  placeholder="Describe your mandate, background, and what you bring to the table..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block flex items-center gap-1"><LinkIcon size={12} /> LinkedIn URL</label>
                <input
                  type="url"
                  value={profile.linkedin_url}
                  onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition`}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: LOCATION & REGION */}
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-white/5 pointer-events-none">
              <Globe size={120} />
            </div>

            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4 relative z-10">
              <Globe size={18} className="text-emerald-400" /> Location & Timezone
            </h2>

            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">City / Hub</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={e => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-emerald-400 focus:outline-none transition"
                  placeholder="e.g. San Francisco"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Country</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={e => setProfile({ ...profile, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-emerald-400 focus:outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={e => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-emerald-400 focus:outline-none transition appearance-none"
                >
                  <option value="UTC">UTC (GMT)</option>
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                  <option value="CET">Central European Time (CET)</option>
                  <option value="PKT">Pakistan Standard Time (PKT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: DYNAMIC AI MATCHING MANDATE */}
          <div className={`trionn-glass-card rounded-3xl border border-${themeColor}-500/30 p-8 shadow-2xl space-y-8 relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 p-6 text-${themeColor}-500/10 pointer-events-none`}>
              {isStartup ? <Rocket size={140} /> : <Target size={140} />}
            </div>

            <h2 className={`text-xl font-bold text-white flex items-center gap-2 border-b border-${themeColor}-500/20 pb-4 relative z-10`}>
              {isStartup ? <Rocket size={18} className={`text-${themeColor}-400`} /> : <Target size={18} className={`text-${themeColor}-400`} />}
              {isStartup ? "Startup AI Valuation & Matching Metrics" : "AI Deal-Flow Engine Parameters"}
            </h2>

            <div className="grid md:grid-cols-2 gap-8 relative z-10">

              {/* === STARTUP SPECIFIC UI === */}
              {isStartup ? (
                <>
                  <div className="space-y-6">
                    <h3 className={`text-xs font-bold text-${themeColor}-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-${themeColor}-500/20 pb-2`}>
                      <Activity size={14} /> Financial Health & Runway
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 block">CURRENT ARR ($)</label>
                        <input
                          type="number"
                          value={startupPrefs.current_arr}
                          onChange={e => setStartupPrefs({ ...startupPrefs, current_arr: Number(e.target.value) })}
                          className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition font-mono`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 block">MONTHLY BURN ($)</label>
                        <input
                          type="number"
                          value={startupPrefs.monthly_burn}
                          onChange={e => setStartupPrefs({ ...startupPrefs, monthly_burn: Number(e.target.value) })}
                          className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition font-mono`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 block">RUNWAY (MONTHS)</label>
                      <input
                        type="number"
                        value={startupPrefs.runway_months}
                        onChange={e => setStartupPrefs({ ...startupPrefs, runway_months: Number(e.target.value) })}
                        className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition font-mono`}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className={`text-xs font-bold text-${themeColor}-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-${themeColor}-500/20 pb-2`}>
                      <Briefcase size={14} /> Strategy & Moat
                    </h3>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 block">PRIMARY SECTOR</label>
                      <input
                        type="text"
                        value={startupPrefs.industry}
                        onChange={e => setStartupPrefs({ ...startupPrefs, industry: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition`}
                        placeholder="e.g. AI, HealthTech"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 block">TECHNICAL MOAT SUMMARY</label>
                      <textarea
                        rows={2}
                        value={startupPrefs.technical_moat}
                        onChange={e => setStartupPrefs({ ...startupPrefs, technical_moat: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition resize-none`}
                        placeholder="Proprietary models, network effects, patents..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 block">TARGET EXIT STRATEGY</label>
                      <select
                        value={startupPrefs.target_exit}
                        onChange={e => setStartupPrefs({ ...startupPrefs, target_exit: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition appearance-none`}
                      >
                        <option value="acquisition">Strategic Acquisition (M&A)</option>
                        <option value="ipo">IPO</option>
                        <option value="pe_buyout">Private Equity Buyout</option>
                        <option value="undecided">Undecided / Growth Focus</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                /* === INVESTOR SPECIFIC UI === */
                <>
                  <div className="space-y-6">
                    <h3 className={`text-xs font-bold text-${themeColor}-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-${themeColor}-500/20 pb-2`}>
                      <DollarSign size={14} /> Capital Deployment
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 block">MINIMUM TICKET ($)</label>
                        <input
                          type="number"
                          value={investorPrefs.min_ticket}
                          onChange={e => setInvestorPrefs({ ...investorPrefs, min_ticket: Number(e.target.value) })}
                          className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition font-mono`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 block">MAXIMUM TICKET ($)</label>
                        <input
                          type="number"
                          value={investorPrefs.max_ticket}
                          onChange={e => setInvestorPrefs({ ...investorPrefs, max_ticket: Number(e.target.value) })}
                          className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition font-mono`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 block">RISK TOLERANCE</label>
                        <select
                          value={investorPrefs.risk_tolerance}
                          onChange={e => setInvestorPrefs({ ...investorPrefs, risk_tolerance: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition appearance-none`}
                        >
                          <option value="conservative">Conservative</option>
                          <option value="balanced">Balanced</option>
                          <option value="aggressive">Aggressive (Deep Tech)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 block">BOARD SEAT REQUIREMENT</label>
                        <select
                          value={investorPrefs.board_involvement}
                          onChange={e => setInvestorPrefs({ ...investorPrefs, board_involvement: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition appearance-none`}
                        >
                          <option value="required">Required</option>
                          <option value="observer">Observer Only</option>
                          <option value="passive">Passive / None</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <label className={`flex items-start gap-4 cursor-pointer group p-3 rounded-xl border border-white/5 bg-white/5 hover:border-${themeColor}-400/30 transition`}>
                        <div className="mt-0.5">
                          <input
                            type="checkbox"
                            checked={investorPrefs.lead_investment}
                            onChange={e => setInvestorPrefs({ ...investorPrefs, lead_investment: e.target.checked })}
                            className={`rounded w-4 h-4 accent-${themeColor}-500`}
                          />
                        </div>
                        <div>
                          <span className={`block font-bold text-white text-sm group-hover:text-${themeColor}-300 transition`}>Willing to Lead Rounds</span>
                          <span className="text-xs text-slate-400">Comfortable pricing rounds and issuing term sheets.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className={`text-xs font-bold text-${themeColor}-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-${themeColor}-500/20 pb-2`}>
                      <Briefcase size={14} /> Focus & Mandate
                    </h3>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 block">PREFERRED STAGES</label>
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
                                  ? `bg-${themeColor}-500/20 border-${themeColor}-500/50 text-${themeColor}-300`
                                  : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
                                }`}
                            >
                              {stage}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 block">INDUSTRIES (COMMA SEPARATED)</label>
                      <input
                        type="text"
                        value={investorPrefs.industries.join(", ")}
                        onChange={e => setInvestorPrefs({ ...investorPrefs, industries: e.target.value.split(",").map(i => i.trim()) })}
                        className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition`}
                        placeholder="e.g. AI, HealthTech, B2B SaaS"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 block">TARGET GEOGRAPHIES (COMMA SEPARATED)</label>
                      <input
                        type="text"
                        value={investorPrefs.geographies.join(", ")}
                        onChange={e => setInvestorPrefs({ ...investorPrefs, geographies: e.target.value.split(",").map(i => i.trim()) })}
                        className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-${themeColor}-400 focus:outline-none transition`}
                        placeholder="e.g. North America, Europe, MENA"
                      />
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
              className={`flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-${themeColor}-400 to-${isStartup ? 'pink' : 'violet'}-500 text-black font-black rounded-xl hover:scale-105 transition-all shadow-xl shadow-${themeColor}-500/20 disabled:opacity-50 disabled:hover:scale-100`}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Syncing to AI Engine..." : "Save Platform Settings"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}