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
  Building, Hash, CheckCircle, XCircle,
  CreditCard, BarChart2, Trash2, PauseCircle, Settings
} from "lucide-react";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import Link from "next/link";

// Custom brand icons (lucide-react deprecated brand icons)
function Twitter({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function Github({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function GlobalPreferencesPage() {
  const { session } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning", text: string } | null>(null);

  // User Activity Stats
  const [activityStats, setActivityStats] = useState({ posts: 0, comments: 0, likes: 0 });

  // 1. Expanded Global Profile State
  const [profile, setProfile] = useState({
    role: "investor",
    tier: "freemium",
    nickname: "",
    username: "",
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
    language: "en", // Added Language
    visibility: "public",
    linkedin_url: "",
    twitter_url: "",
    website_url: "",
    github_url: "", // Extended Social
    presence_status: "online",
  });

  const [initialUsername, setInitialUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // 3. AI Search Engine Parameters (Investor)
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

  // 3. AI Search Engine Parameters (Startup)
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
      // Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile({
          role: profileData.role || "investor",
          tier: profileData.tier || "freemium",
          nickname: profileData.nickname || "",
          username: profileData.username || "",
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
          language: "en", // Default fallback
          visibility: profileData.visibility || "public",
          linkedin_url: profileData.linkedin_url || "",
          twitter_url: profileData.twitter_url || "",
          website_url: profileData.website_url || "",
          github_url: "",
          presence_status: profileData.presence_status || "online",
        });
        setInitialUsername(profileData.username || "");

        // Fetch AI Preferences
        if (profileData.role === "investor") {
          const { data: prefData } = await supabase.from("investor_preferences").select("*").eq("investor_id", session.user.id).single();
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
              target_company_size: prefData.target_company_size || "1-10",
              target_operational_locations: prefData.target_operational_locations || "",
            });
          }
        } else {
          const { data: startupData } = await supabase.from("startup_profiles").select("*").eq("profile_id", session.user.id).single();
          if (startupData) {
            setStartupPrefs({
              current_arr: startupData.current_arr || 0,
              monthly_burn: startupData.monthly_burn || 0,
              operational_costs: startupData.operational_costs || 0,
              runway_months: startupData.runway_months || 12,
              technical_moat: startupData.technical_moat || "",
              target_exit: startupData.target_exit || "acquisition",
              industry: startupData.industry || "",
              company_size: startupData.company_size || "1-10",
              operational_locations: startupData.operational_locations || "",
            });
          }
        }

        // Fetch Activity Stats
        const [postsRes, commentsRes, likesRes] = await Promise.all([
          supabase.from("posts").select("id", { count: 'exact', head: true }).eq("author_id", session.user.id),
          supabase.from("comments").select("id", { count: 'exact', head: true }).eq("author_id", session.user.id),
          supabase.from("likes").select("id", { count: 'exact', head: true }).eq("user_id", session.user.id)
        ]);

        setActivityStats({
          posts: postsRes.count || 0,
          comments: commentsRes.count || 0,
          likes: likesRes.count || 0
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, [session]);

  // Username Checker
  useEffect(() => {
    if (!profile.username || profile.username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    if (profile.username === initialUsername) {
      setUsernameStatus('available');
      return;
    }
    const checkAvailability = async () => {
      setUsernameStatus('checking');
      const { data } = await supabase.from("profiles").select("id").eq("username", profile.username).maybeSingle();
      if (data && data.id !== session?.user?.id) setUsernameStatus('taken');
      else setUsernameStatus('available');
    };
    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [profile.username, initialUsername, session?.user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || usernameStatus === 'taken') return;
    setSaving(true);
    setMessage(null);

    try {
      const { role, tier, language, github_url, ...profileUpdates } = profile;

      // 1. Update Core Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: role,
          ...profileUpdates,
          dob: profileUpdates.dob || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", session.user.id);
      if (profileError) throw profileError;

      setInitialUsername(profile.username);

      // 2. Update AI Match Prefs
      if (role === "investor") {
        const { error: prefError } = await supabase
          .from("investor_preferences")
          .update({ ...investorPrefs, updated_at: new Date().toISOString() })
          .eq("investor_id", session.user.id);
        if (prefError) throw prefError;
      } else {
        const { error: startupError } = await supabase
          .from("startup_profiles")
          .update({ ...startupPrefs, updated_at: new Date().toISOString() })
          .eq("profile_id", session.user.id);
        if (startupError) throw startupError;
      }

      setMessage({ type: "success", text: "Settings synchronized with AI routing engine." });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to save settings." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleDeactivate = async () => {
    const confirm = window.confirm("Deactivating hides your profile from the public feed. You can only do this once every 15 days. Proceed?");
    if (!confirm) return;

    const { error } = await supabase.from('profiles').update({ presence_status: 'suspended' }).eq('id', session?.user?.id);
    if (!error) {
      setProfile(prev => ({ ...prev, presence_status: 'suspended' }));
      setMessage({ type: "warning", text: "Account deactivated. You can reactivate at any time." });
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure? This will initiate a 30-day deletion countdown. After 30 days, all data is permanently wiped.");
    if (!confirm) return;

    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    const { error } = await supabase.from('profiles').update({ deleted_at: deletionDate.toISOString() }).eq('id', session?.user?.id);
    if (!error) {
      setMessage({ type: "error", text: `Account scheduled for deletion on ${deletionDate.toLocaleDateString()}.` });
    }
  };

  const isStartup = profile.role === "startup";
  if (loading) return <RoleRoutingLoader message="Loading Platform Settings..." />;

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-5xl w-full relative z-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--secondary)] flex items-center gap-3">
            <Settings className="text-[var(--accent)]" size={32} />
            Global Settings
          </h1>
          <p className="text-[var(--secondary)]/70 text-sm max-w-2xl leading-relaxed font-medium">
            Configure your identity, platform environment, and AI matching parameters all in one place.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" :
            message.type === "warning" ? "bg-amber-500/10 border-amber-500/30 text-amber-600" :
              "bg-rose-500/10 border-rose-500/30 text-rose-600"}`}>
            <AlertCircle size={18} /> {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-12">

          {/* ==========================================
              SECTION 1: USER PROFILE SETTINGS 
          ========================================== */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-4">
              <User size={24} className="text-[var(--accent)]" /> 1. User Profile Settings
            </h2>

            {/* Core Identity */}
            <div className="neu-flat-base p-8 space-y-6 rounded-3xl">
              <h3 className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider">Identity & Base Info</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2 lg:col-span-3 neu-pressed-base p-4 rounded-xl border border-[var(--secondary)]/5">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/60 tracking-wider flex items-center gap-1">
                    <Hash size={12} /> System User ID (Read-Only)
                  </label>
                  <input type="text" value={session?.user?.id || ""} disabled className="w-full px-4 py-2 rounded-lg bg-[var(--primary)] text-xs text-[var(--secondary)]/50 font-mono cursor-not-allowed border border-[var(--secondary)]/10" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Display / Alias Name</label>
                  <input type="text" value={profile.nickname} onChange={e => setProfile({ ...profile, nickname: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition shadow-inner" placeholder="Official identifier" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">@ Username (Handle)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--secondary)]/50 font-mono">@</span>
                    <input type="text" value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} className={`w-full pl-8 pr-10 py-3 rounded-xl border bg-[var(--primary)] text-sm focus:outline-none transition shadow-inner ${usernameStatus === 'taken' ? 'border-rose-500' : 'border-[var(--secondary)]/10 focus:border-[var(--accent)]'}`} placeholder="unique_handle" minLength={3} maxLength={20} />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && <Loader2 size={16} className="animate-spin text-[var(--accent)]" />}
                      {usernameStatus === 'available' && <CheckCircle size={16} className="text-emerald-500" />}
                      {usernameStatus === 'taken' && <XCircle size={16} className="text-rose-500" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Company Name</label>
                  <input type="text" value={profile.company_name} onChange={e => setProfile({ ...profile, company_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition shadow-inner" placeholder="Legal Entity" />
                </div>

                <div className="space-y-2 lg:col-span-3">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Professional Biography / Elevator Pitch</label>
                  <textarea rows={3} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition resize-none shadow-inner" placeholder="Describe your background and what you bring to the table..." />
                </div>
              </div>
            </div>

            {/* Social Links & Visibility */}
            <div className="neu-flat-base p-8 space-y-6 rounded-3xl">
              <h3 className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider flex items-center justify-between">
                <span>Profile Visibility & Social Links</span>
                <select value={profile.visibility} onChange={e => setProfile({ ...profile, visibility: e.target.value })} className="px-3 py-1 text-xs rounded-lg border border-[var(--secondary)]/10 bg-[var(--primary)] font-bold text-[var(--accent)] outline-none">
                  <option value="public">Public Profile</option>
                  <option value="private">Private Profile</option>
                </select>
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider flex items-center gap-1"><LinkIcon size={12} /> Website URL</label>
                  <input type="url" value={profile.website_url} onChange={e => setProfile({ ...profile, website_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition shadow-inner" placeholder="https://yourcompany.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider flex items-center gap-1"><Globe size={12} /> LinkedIn URL</label>
                  <input type="url" value={profile.linkedin_url} onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition shadow-inner" placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider flex items-center gap-1"><Twitter size={12} /> Twitter / X URL</label>
                  <input type="url" value={profile.twitter_url} onChange={e => setProfile({ ...profile, twitter_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition shadow-inner" placeholder="https://twitter.com/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider flex items-center gap-1"><Github size={12} /> GitHub / Portfolio URL</label>
                  <input type="url" value={profile.github_url} onChange={e => setProfile({ ...profile, github_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition shadow-inner" placeholder="https://github.com/..." />
                </div>
              </div>
            </div>

            {/* Subscription & Activity Log */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="neu-flat-base p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider flex items-center gap-2 mb-4">
                    <CreditCard size={16} className="text-[var(--accent)]" /> Subscription Status
                  </h3>
                  <div className="p-4 rounded-xl bg-[var(--secondary)]/5 border border-[var(--secondary)]/10 shadow-inner flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--secondary)]/50 tracking-wider">Current Tier</p>
                      <h4 className="text-lg font-black text-[var(--secondary)] capitalize">{profile.tier}</h4>
                    </div>
                    <Link href="/pricing" className="neu-btn px-4 py-2 text-xs">Manage</Link>
                  </div>
                </div>
              </div>

              <div className="neu-flat-base p-6 rounded-3xl">
                <h3 className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider flex items-center gap-2 mb-4">
                  <BarChart2 size={16} className="text-[var(--accent)]" /> Activity Log
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-[var(--secondary)]/5 shadow-inner">
                    <p className="text-xl font-black text-[var(--accent)]">{activityStats.posts}</p>
                    <p className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase">Posts</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--secondary)]/5 shadow-inner">
                    <p className="text-xl font-black text-[var(--accent)]">{activityStats.comments}</p>
                    <p className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase">Comments</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--secondary)]/5 shadow-inner">
                    <p className="text-xl font-black text-[var(--accent)]">{activityStats.likes}</p>
                    <p className="text-[10px] font-bold text-[var(--secondary)]/60 uppercase">Likes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Danger Zone */}
            <div className="neu-flat-base p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5">
              <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-4">Account Management</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={handleDeactivate} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 text-xs font-bold hover:bg-amber-500/20 transition">
                  <PauseCircle size={16} /> Deactivate Profile (15-Day Lock)
                </button>
                <button type="button" onClick={handleDelete} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 text-xs font-bold hover:bg-rose-500/20 transition">
                  <Trash2 size={16} /> Delete Account (30-Day Grace)
                </button>
              </div>
            </div>
          </section>


          {/* ==========================================
              SECTION 2: PLATFORM RELATED SETTINGS 
          ========================================== */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-4">
              <Globe size={24} className="text-[var(--accent)]" /> 2. Platform Related Settings
            </h2>

            <div className="neu-flat-base p-8 space-y-6 rounded-3xl">
              <h3 className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider">Localization</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Timezone</label>
                  <select value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner">
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="America/New_York">EST (New York)</option>
                    <option value="America/Los_Angeles">PST (Los Angeles)</option>
                    <option value="Europe/London">GMT (London)</option>
                    <option value="Asia/Karachi">PKT (Karachi)</option>
                    <option value="Asia/Dubai">GST (Dubai)</option>
                    <option value="Asia/Singapore">SGT (Singapore)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Platform Language</label>
                  <select value={profile.language} onChange={e => setProfile({ ...profile, language: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner">
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="neu-flat-base p-8 space-y-6 rounded-3xl">
              <h3 className="text-sm font-bold text-[var(--secondary)] uppercase tracking-wider">Vibrant Neo-Themes</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: "secure", name: "Rock-Solid Secure", desc: "Corporate grey & growth green." },
                  { id: "innovator", name: "Corporate Innovator", desc: "Pure white & vibrant teal." },
                  { id: "integrator", name: "Dynamic Integrator", desc: "Charcoal dark mode & orange." },
                  { id: "holistic", name: "Intelligent Holistic", desc: "Soft off-white & premium purple." },
                  { id: "humanistic", name: "Humanistic Tech", desc: "Warm white & deep raspberry." },
                  { id: "cyberpunk", name: "Cyberpunk Edge", desc: "Neon Pink & Cyan on Obsidian." },
                  { id: "synthwave", name: "Synthwave Neo", desc: "Deep Purple & Magenta glows." },
                  { id: "aurora", name: "Arctic Aurora", desc: "Electric Teal & Emerald vibes." }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as any)}
                    className={`text-left p-4 rounded-xl border transition-all ${theme === t.id ? 'border-[var(--accent)] neu-pressed-base shadow-inner ring-1 ring-[var(--accent)]/50' : 'border-transparent neu-btn hover:border-[var(--accent)]/30'}`}
                  >
                    <span className="block font-black text-[var(--secondary)] text-sm">{t.name}</span>
                    <span className="block text-[var(--secondary)]/70 text-xs mt-1 font-medium">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>


          {/* ==========================================
              SECTION 3: AI SEARCH ENGINE PARAMETERS 
          ========================================== */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-[var(--secondary)] flex items-center gap-2 border-b border-[var(--secondary)]/10 pb-4">
              <Target size={24} className="text-[var(--accent)]" /> 3. AI Search Engine Parameters
            </h2>

            <div className="neu-flat-base p-8 space-y-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-[var(--secondary)]/5 pointer-events-none">
                {isStartup ? <Rocket size={140} /> : <Target size={140} />}
              </div>

              <div className="grid md:grid-cols-2 gap-8 relative z-10">
                {isStartup ? (
                  <>
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold text-[var(--secondary)]/80 uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--secondary)]/10 pb-2">
                        <Building size={14} className="text-[var(--accent)]" /> Operations & Scale
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">COMPANY SIZE</label>
                          <select value={startupPrefs.company_size} onChange={e => setStartupPrefs({ ...startupPrefs, company_size: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner">
                            <option value="1-10">1 - 10</option>
                            <option value="11-50">11 - 50</option>
                            <option value="51-200">51 - 200</option>
                            <option value="201+">201+</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">OPERATIONAL LOCATIONS</label>
                          <input type="text" value={startupPrefs.operational_locations} onChange={e => setStartupPrefs({ ...startupPrefs, operational_locations: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition shadow-inner" placeholder="e.g. US, UK, Remote" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">CURRENT ARR ($)</label>
                          <input type="number" value={startupPrefs.current_arr} onChange={e => setStartupPrefs({ ...startupPrefs, current_arr: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">RUNWAY (MONTHS)</label>
                          <input type="number" value={startupPrefs.runway_months} onChange={e => setStartupPrefs({ ...startupPrefs, runway_months: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">MONTHLY BURN ($)</label>
                          <input type="number" value={startupPrefs.monthly_burn} onChange={e => setStartupPrefs({ ...startupPrefs, monthly_burn: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">OPERATIONAL COSTS ($)</label>
                          <input type="number" value={startupPrefs.operational_costs} onChange={e => setStartupPrefs({ ...startupPrefs, operational_costs: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xs font-bold text-[var(--secondary)]/80 uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--secondary)]/10 pb-2">
                        <Briefcase size={14} className="text-[var(--accent)]" /> Strategy & Moat
                      </h3>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">TARGET EXIT STRATEGY</label>
                        <select value={startupPrefs.target_exit} onChange={e => setStartupPrefs({ ...startupPrefs, target_exit: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner">
                          <option value="acquisition">Strategic Acquisition (M&A)</option>
                          <option value="ipo">IPO</option>
                          <option value="pe_buyout">Private Equity Buyout</option>
                          <option value="undecided">Undecided / Growth Focus</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">TECHNICAL MOAT SUMMARY</label>
                        <textarea rows={6} value={startupPrefs.technical_moat} onChange={e => setStartupPrefs({ ...startupPrefs, technical_moat: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition resize-none shadow-inner" placeholder="Proprietary models, network effects..." />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold text-[var(--secondary)]/80 uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--secondary)]/10 pb-2">
                        <DollarSign size={14} className="text-[var(--accent)]" /> Capital Deployment
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">MINIMUM TICKET ($)</label>
                          <input type="number" value={investorPrefs.min_ticket} onChange={e => setInvestorPrefs({ ...investorPrefs, min_ticket: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">MAXIMUM TICKET ($)</label>
                          <input type="number" value={investorPrefs.max_ticket} onChange={e => setInvestorPrefs({ ...investorPrefs, max_ticket: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">RISK TOLERANCE</label>
                          <select value={investorPrefs.risk_tolerance} onChange={e => setInvestorPrefs({ ...investorPrefs, risk_tolerance: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner">
                            <option value="conservative">Conservative</option>
                            <option value="balanced">Balanced</option>
                            <option value="aggressive">Aggressive (Deep Tech)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">BOARD SEAT REQUIREMENT</label>
                          <select value={investorPrefs.board_involvement} onChange={e => setInvestorPrefs({ ...investorPrefs, board_involvement: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner">
                            <option value="required">Required</option>
                            <option value="observer">Observer Only</option>
                            <option value="passive">Passive / None</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <label className="flex items-start gap-4 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-[var(--accent)]/30 transition neu-flat-base shadow-none">
                          <div className="mt-0.5"><input type="checkbox" checked={investorPrefs.lead_investment} onChange={e => setInvestorPrefs({ ...investorPrefs, lead_investment: e.target.checked })} className="rounded w-4 h-4" /></div>
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
                          <select value={investorPrefs.target_company_size} onChange={e => setInvestorPrefs({ ...investorPrefs, target_company_size: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner">
                            <option value="1-10">1 - 10 Employees</option>
                            <option value="11-50">11 - 50 Employees</option>
                            <option value="51-200">51 - 200 Employees</option>
                            <option value="201+">201+ Employees</option>
                            <option value="agnostic">Agnostic</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">TARGET OPS LOCATIONS</label>
                          <input type="text" value={investorPrefs.target_operational_locations} onChange={e => setInvestorPrefs({ ...investorPrefs, target_operational_locations: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm focus:border-[var(--accent)] focus:outline-none transition shadow-inner" placeholder="e.g. US, Remote" />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-bold text-[var(--secondary)]/70 block">PREFERRED STAGES</label>
                        <div className="flex flex-wrap gap-2">
                          {["Pre-Seed", "Seed", "Series A", "Series B", "Growth"].map(stage => {
                            const isSelected = investorPrefs.preferred_stages.includes(stage);
                            return (
                              <button
                                key={stage} type="button"
                                onClick={() => setInvestorPrefs({ ...investorPrefs, preferred_stages: isSelected ? investorPrefs.preferred_stages.filter(s => s !== stage) : [...investorPrefs.preferred_stages, stage] })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${isSelected ? 'border-[var(--accent)] text-[var(--accent)] neu-pressed-base' : 'border-transparent text-[var(--secondary)]/70 hover:text-[var(--secondary)] neu-btn'}`}
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
          </section>

          {/* GLOBAL SAVE BUTTON */}
          <div className="flex justify-end pt-4 pb-10 sticky bottom-6 z-50">
            <button
              type="submit"
              disabled={saving || usernameStatus === 'checking' || usernameStatus === 'taken'}
              className="neu-btn px-10 py-5 disabled:opacity-50 shadow-2xl hover:scale-105 transition-transform"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {saving ? "Syncing to AI Engine..." : "Save All Platform Settings"}
            </button>
          </div>

        </form>
      </main>

      <Footer />
    </div>
  );
}