"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Save, AlertCircle, User, Globe, Target, DollarSign,
  Briefcase, Shield, MapPin, Link as LinkIcon, Loader2
} from "lucide-react";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";

export default function GlobalPreferencesPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // Global Profile State
  const [profile, setProfile] = useState({
    nickname: "",
    bio: "",
    city: "",
    country: "",
    timezone: "UTC",
    visibility: "public",
    linkedin_url: "",
  });

  // AI Matching / Investor Preferences State
  const [preferences, setPreferences] = useState({
    min_ticket: 50000,
    max_ticket: 500000,
    preferred_stages: [] as string[],
    industries: [] as string[],
    geographies: [] as string[],
    lead_investment: false,
    follow_on: false,
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchSettings = async () => {
      // Fetch Global Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("nickname, bio, city, country, timezone, visibility, linkedin_url")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile({
          nickname: profileData.nickname || "",
          bio: profileData.bio || "",
          city: profileData.city || "",
          country: profileData.country || "",
          timezone: profileData.timezone || "UTC",
          visibility: profileData.visibility || "public",
          linkedin_url: profileData.linkedin_url || "",
        });
      }

      // Fetch AI Investor Preferences
      const { data: prefData } = await supabase
        .from("investor_preferences")
        .select("*")
        .eq("investor_id", session.user.id)
        .single();

      if (prefData) {
        setPreferences({
          min_ticket: prefData.min_ticket || 50000,
          max_ticket: prefData.max_ticket || 500000,
          preferred_stages: prefData.preferred_stages || [],
          industries: prefData.industries || [],
          geographies: prefData.geographies || [],
          lead_investment: prefData.lead_investment || false,
          follow_on: prefData.follow_on || false,
        });
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
      // 1. Update Global Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      // 2. Upsert AI Matching Preferences
      const { error: prefError } = await supabase
        .from("investor_preferences")
        .upsert({
          investor_id: session.user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (prefError) throw prefError;

      setMessage({ type: "success", text: "Global settings and AI preferences securely updated." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save preferences." });
    } finally {
      setSaving(false);
      // Auto-hide success message
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const STAGE_OPTIONS = ["Pre-Seed", "Seed", "Series A", "Series B", "Growth"];

  if (loading) return <RoleRoutingLoader message="Loading Platform Settings..." />;

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-5xl w-full relative z-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <Target className="text-cyan-400" size={32} />
            Global Settings & AI Preferences
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Configure your public identity and fine-tune your deal-flow algorithm. The platform's AI routing engine utilizes these data points to surface highly relevant marketplace connections.
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
              <User size={18} className="text-violet-400" /> Identity & Public Profile
            </h2>

            <div className="grid md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Display Name</label>
                <input
                  type="text"
                  value={profile.nickname}
                  onChange={e => setProfile({ ...profile, nickname: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-violet-400 focus:outline-none transition"
                  placeholder="e.g. Strategic Capital Partner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Profile Visibility</label>
                <select
                  value={profile.visibility}
                  onChange={e => setProfile({ ...profile, visibility: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-violet-400 focus:outline-none transition appearance-none"
                >
                  <option value="public">Public (Visible in Directory)</option>
                  <option value="private">Private (Hidden, Direct Link Only)</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Professional Biography</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-violet-400 focus:outline-none transition resize-none"
                  placeholder="Describe your mandate, background, and what you bring to the table..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block flex items-center gap-1"><LinkIcon size={12} /> LinkedIn URL</label>
                <input
                  type="url"
                  value={profile.linkedin_url}
                  onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-violet-400 focus:outline-none transition"
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
                  placeholder="e.g. United States"
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

          {/* SECTION 3: AI MATCHING MANDATE */}
          <div className="trionn-glass-card rounded-3xl border border-cyan-500/30 p-8 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-cyan-500/10 pointer-events-none">
              <Target size={140} />
            </div>

            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-cyan-500/20 pb-4 relative z-10">
              <Target size={18} className="text-cyan-400" /> AI Deal-Flow Engine Parameters
            </h2>

            <div className="grid md:grid-cols-2 gap-8 relative z-10">

              {/* Ticket Sizes */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-cyan-500/20 pb-2">
                  <DollarSign size={14} /> Capital Deployment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 block">MINIMUM TICKET ($)</label>
                    <input
                      type="number"
                      value={preferences.min_ticket}
                      onChange={e => setPreferences({ ...preferences, min_ticket: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-cyan-400 focus:outline-none transition font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 block">MAXIMUM TICKET ($)</label>
                    <input
                      type="number"
                      value={preferences.max_ticket}
                      onChange={e => setPreferences({ ...preferences, max_ticket: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-cyan-400 focus:outline-none transition font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-start gap-4 cursor-pointer group p-3 rounded-xl border border-white/5 bg-white/5 hover:border-cyan-400/30 transition">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={preferences.lead_investment}
                        onChange={e => setPreferences({ ...preferences, lead_investment: e.target.checked })}
                        className="rounded w-4 h-4 accent-cyan-500"
                      />
                    </div>
                    <div>
                      <span className="block font-bold text-white text-sm group-hover:text-cyan-300 transition">Willing to Lead Rounds</span>
                      <span className="text-xs text-slate-400">Comfortable pricing rounds and issuing term sheets.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 cursor-pointer group p-3 rounded-xl border border-white/5 bg-white/5 hover:border-cyan-400/30 transition">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={preferences.follow_on}
                        onChange={e => setPreferences({ ...preferences, follow_on: e.target.checked })}
                        className="rounded w-4 h-4 accent-cyan-500"
                      />
                    </div>
                    <div>
                      <span className="block font-bold text-white text-sm group-hover:text-cyan-300 transition">Follow-on Capital Available</span>
                      <span className="text-xs text-slate-400">Reserves capital for subsequent funding rounds.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sectors & Stages */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-cyan-500/20 pb-2">
                  <Briefcase size={14} /> Focus & Mandate
                </h3>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 block">PREFERRED STAGES</label>
                  <div className="flex flex-wrap gap-2">
                    {STAGE_OPTIONS.map(stage => {
                      const isSelected = preferences.preferred_stages.includes(stage);
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => {
                            const newStages = isSelected
                              ? preferences.preferred_stages.filter(s => s !== stage)
                              : [...preferences.preferred_stages, stage];
                            setPreferences({ ...preferences, preferred_stages: newStages });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${isSelected
                              ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
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
                    value={preferences.industries.join(", ")}
                    onChange={e => setPreferences({ ...preferences, industries: e.target.value.split(",").map(i => i.trim()) })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-cyan-400 focus:outline-none transition"
                    placeholder="e.g. AI, HealthTech, B2B SaaS"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 block">TARGET GEOGRAPHIES (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={preferences.geographies.join(", ")}
                    onChange={e => setPreferences({ ...preferences, geographies: e.target.value.split(",").map(i => i.trim()) })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white focus:border-cyan-400 focus:outline-none transition"
                    placeholder="e.g. North America, Europe, MENA"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-4 pb-10">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-black font-black rounded-xl hover:scale-105 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Syncing to Database..." : "Save Platform Settings"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}