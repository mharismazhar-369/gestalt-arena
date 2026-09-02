"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useChat } from "@/components/context/ChatContext";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import {
  UserPlus, UserCheck, ShieldCheck, MapPin, DollarSign, Building2,
  Users, MessageSquare, Edit3, Globe, Link as LinkIcon,
  Briefcase, TrendingUp, FileText, Plane, Lock, Activity, Target,
  User, CheckCircle2, EyeOff, Presentation, Eye
} from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const profileId = params?.id ? String(params.id) : "";
  const { session } = useAuth();
  const { openChat } = useChat();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [startupData, setStartupData] = useState<any>(null);
  const [investorData, setInvestorData] = useState<any>(null);

  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // New states for Deal Flow
  const [pitchDecks, setPitchDecks] = useState<any[]>([]);
  const [bidDecks, setBidDecks] = useState<any[]>([]);

  const isOwnProfile = session?.user?.id === profileId;
  const isConnected = isOwnProfile || following;

  useEffect(() => {
    if (!profileId) return;

    async function fetchProfileData() {
      // 1. Fetch Core Profile
      const { data: coreData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (!coreData) {
        setLoading(false);
        return;
      }
      setProfile(coreData);

      // 2. Fetch Role-Specific Preferences & Deal Flow Records
      if (coreData.role === "startup") {
        const { data: startupRes } = await supabase.from("startup_profiles").select("*").eq("profile_id", profileId).single();
        if (startupRes) setStartupData(startupRes);

        const { data: pitches } = await supabase.from("pitch_decks").select("*").eq("user_id", profileId).order("created_at", { ascending: false });
        if (pitches) setPitchDecks(pitches);

      } else if (coreData.role === "investor") {
        const { data: prefRes } = await supabase.from("investor_preferences").select("*").eq("investor_id", profileId).single();
        if (prefRes) setInvestorData(prefRes);

        const { data: bids } = await supabase.from("investor_bid_decks").select("*").eq("investor_id", profileId).order("created_at", { ascending: false });
        if (bids) setBidDecks(bids);
      }

      // 3. Fetch Recent Feed Activity
      const { data: postsData } = await supabase
        .from("posts")
        .select("id, content, created_at")
        .eq("author_id", profileId)
        .order("created_at", { ascending: false })
        .limit(3);
      if (postsData) setRecentPosts(postsData);

      // 4. Fetch Network Connections
      const { count } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profileId);
      setFollowerCount(count || 0);

      if (session?.user) {
        const { data: followData } = await supabase.from("follows").select("*").eq("follower_id", session.user.id).eq("following_id", profileId).single();
        if (followData) setFollowing(true);
      }

      setLoading(false);
    }

    fetchProfileData();
  }, [profileId, session]);

  const toggleFollow = async () => {
    if (!session?.user) return alert("You must be logged in to add to your network.");
    if (session.user.id === profileId) return;

    if (following) {
      setFollowing(false);
      setFollowerCount((prev) => prev - 1);
      await supabase.from("follows").delete().match({ follower_id: session.user.id, following_id: profileId });
    } else {
      setFollowing(true);
      setFollowerCount((prev) => prev + 1);
      await supabase.from("follows").insert({ follower_id: session.user.id, following_id: profileId });
      await supabase.from("notifications").insert({ user_id: profileId, actor_id: session.user.id, type: "follow", message: "added you to their network." });
    }
  };

  if (loading) return <RoleRoutingLoader message="Loading Profile Data..." />;
  if (!profile) return (
    <div className="min-h-screen bg-[#02040a] text-white flex items-center justify-center trionn-grid-bg">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-300">Profile Not Found</h2>
        <p className="text-slate-500">This user does not exist or has an incomplete record.</p>
      </div>
    </div>
  );

  const isStartup = profile.role === "startup";
  const displayName = profile.nickname || profile.company_name || "Arena Member";
  const displayRole = isStartup ? "Startup Founder" : "Investor / Capital Partner";
  const themeColor = isStartup ? "violet" : "cyan";

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-8">

        {/* HEADER BANNER */}
        <div className={`trionn-glass-card rounded-3xl border border-${themeColor}-500/30 p-8 md:p-10 relative overflow-hidden shadow-2xl space-y-6`}>
          <div className={`absolute top-0 right-0 p-8 text-${themeColor}-500/5 pointer-events-none`}>
            {isStartup ? <Plane size={240} /> : <Building2 size={240} />}
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex items-start gap-5">
              <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-${themeColor}-400 to-${isStartup ? 'pink' : 'violet'}-500 text-black font-black text-3xl uppercase shadow-xl`}>
                {displayName.slice(0, 2)}
              </div>

              <div className="space-y-2 mt-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-black text-white">{displayName}</h1>
                  {profile.profile_completed && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                  {profile.dob && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/30 bg-blue-400/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-400">
                      <CheckCircle2 size={12} /> ID Confirmed
                    </span>
                  )}
                  <BetaBadge variant="pill" />
                </div>

                <p className={`text-sm text-${themeColor}-400 font-bold capitalize`}>
                  {profile.company_name ? `${profile.company_name} • ` : ""}{displayRole}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className={`text-${themeColor}-400`} />
                    {profile.city ? `${profile.city}, ${profile.state ? profile.state + ', ' : ''}${profile.country || ""}` : "Global Network"}
                  </span>
                  <span>•</span>
                  <span className={`flex items-center gap-1 font-bold text-${isStartup ? 'pink' : 'violet'}-300`}>
                    <Users size={14} /> {followerCount} Connections
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isOwnProfile ? (
                <Link href="/dashboard/preferences" className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition shadow-xl border border-${themeColor}-400/30 bg-${themeColor}-500/10 text-${themeColor}-300 hover:bg-${themeColor}-500/20`}>
                  <Edit3 size={16} /> Edit Settings
                </Link>
              ) : (
                <>
                  <button onClick={toggleFollow} className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition shadow-xl ${following ? "bg-slate-800 text-slate-300 border border-white/10" : `bg-gradient-to-r from-${themeColor}-400 to-${isStartup ? 'pink' : 'violet'}-500 text-black hover:scale-105`}`}>
                    {following ? <><UserCheck size={16} className="text-emerald-400" /> In Network</> : <><UserPlus size={16} /> Connect</>}
                  </button>
                  {following && (
                    <button onClick={() => openChat(profileId, displayName, displayName.slice(0, 2))} className="flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition shadow-xl bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105">
                      <MessageSquare size={16} /> Message
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 space-y-3 relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isStartup ? "Elevator Pitch & Overview" : "Investment Mandate & Thesis"}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl whitespace-pre-line">
              {profile.bio || profile.elevator_pitch || "No overview provided yet."}
            </p>
          </div>
        </div>

        {/* 3-CARD DATA LAYOUT */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* CARD 1: Core Identity */}
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
              <User size={150} />
            </div>
            <h3 className={`text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2 relative z-10`}><User size={16} className={`text-${themeColor}-400`} /> Core Identity</h3>
            <div className="space-y-4 relative z-10">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Company Entity</span>
                <span className="text-sm font-semibold text-white">{profile.company_name || "Undisclosed"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Role Type</span>
                  <span className="text-xs font-semibold text-white capitalize">{profile.ownership_type || profile.role}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Gender</span>
                  <span className="text-xs font-semibold text-white">{profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : 'Not Specified'}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Primary Industry</span>
                <span className="text-sm font-semibold text-white">{profile.industry || "General"}</span>
              </div>
            </div>
          </div>

          {/* CARD 2: Network Intent */}
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
              <Target size={150} />
            </div>
            <h3 className={`text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2 relative z-10`}><Target size={16} className={`text-${themeColor}-400`} /> Network Intent</h3>
            <div className="space-y-4 relative z-10">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Service / Offering Type</span>
                <span className="text-sm font-semibold text-white capitalize">{profile.services_offering || "Products"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Interested In</span>
                <span className="text-sm font-semibold text-white capitalize">{profile.interested_in || "Founders"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Target Market</span>
                <span className="text-sm font-semibold text-white capitalize">{profile.interested_market?.replace("_", " ") || "Global"}</span>
              </div>
            </div>
          </div>

          {/* CARD 3: AI Metrics & Operations */}
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
              <Activity size={150} />
            </div>
            <h3 className={`text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2 relative z-10`}><Activity size={16} className={`text-${themeColor}-400`} /> Operations & Scale</h3>
            <div className="space-y-4 relative z-10">
              {isStartup ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Team Size</span>
                      <span className="text-xs font-semibold text-white">{startupData?.company_size || "1-10"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Runway</span>
                      <span className="text-xs font-semibold text-white">{startupData?.runway_months || "N/A"} Months</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Target Exit Strategy</span>
                    <span className="text-sm font-semibold text-white capitalize">{startupData?.target_exit?.replace("_", " ") || "Growth"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Operational Locations</span>
                    <span className="text-sm font-semibold text-white">{startupData?.operational_locations || "Global"}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Risk Tolerance</span>
                      <span className="text-xs font-semibold text-white capitalize">{investorData?.risk_tolerance || "Balanced"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Board Seats</span>
                      <span className="text-xs font-semibold text-white capitalize">{investorData?.board_involvement || "Observer"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Target Company Size</span>
                    <span className="text-sm font-semibold text-white">{investorData?.target_company_size || "Agnostic"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Target Geographies</span>
                    <span className="text-sm font-semibold text-white">{investorData?.geographies?.join(", ") || "Global"}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Sensitive Financials & Links */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* SENSITIVE FINANCIAL DATA CARD */}
          <div className="md:col-span-2 trionn-glass-card rounded-3xl border border-white/10 p-6 shadow-xl flex flex-col justify-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" /> Financial Health & Capital
              </h3>
              {!isConnected && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-md flex items-center gap-1">
                  <Lock size={10} /> Private Data
                </span>
              )}
            </div>

            {isConnected ? (
              <div className="grid grid-cols-3 gap-4">
                {isStartup ? (
                  <>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Current ARR</span>
                      <span className="text-lg font-mono font-bold text-emerald-400">${startupData?.current_arr?.toLocaleString() || 0}</span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Monthly Burn</span>
                      <span className="text-lg font-mono font-bold text-rose-400">${startupData?.monthly_burn?.toLocaleString() || 0}</span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Operational Costs</span>
                      <span className="text-lg font-mono font-bold text-amber-400">${startupData?.operational_costs?.toLocaleString() || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Min Ticket</span>
                      <span className="text-lg font-mono font-bold text-emerald-400">${investorData?.min_ticket?.toLocaleString() || 0}</span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Max Ticket</span>
                      <span className="text-lg font-mono font-bold text-emerald-400">${investorData?.max_ticket?.toLocaleString() || 0}</span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Willing to Lead</span>
                      <span className="text-lg font-mono font-bold text-cyan-400">{investorData?.lead_investment ? "Yes" : "No"}</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-black/40 rounded-xl border border-white/5">
                <EyeOff size={32} className="text-slate-600 mb-2" />
                <p className="text-sm font-bold text-slate-300">Internal Financials Masked</p>
                <p className="text-xs text-slate-500 max-w-sm">Connect with this user to view their restricted operational costs, burn rates, and exact capital requirements.</p>
                <button onClick={toggleFollow} className={`mt-2 px-4 py-2 text-xs font-bold rounded-lg bg-${themeColor}-500/20 text-${themeColor}-400 hover:bg-${themeColor}-500 hover:text-black transition`}>
                  Request Connection
                </button>
              </div>
            )}
          </div>

          {/* OFFICIAL LINKS CARD */}
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">Official Links</h3>
            <div className="space-y-3 flex-grow">
              <div className="flex flex-col gap-1 bg-black/20 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><Globe size={12} /> Website</span>
                <a href={profile.website_url || "#"} target="_blank" className="text-sm text-cyan-400 hover:underline truncate">{profile.website_url || "Not provided"}</a>
              </div>
              <div className="flex flex-col gap-1 bg-black/20 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><LinkIcon size={12} /> LinkedIn</span>
                <a href={profile.linkedin_url || "#"} target="_blank" className="text-sm text-cyan-400 hover:underline truncate">{profile.linkedin_url || "Not provided"}</a>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE DEAL FLOW (PITCHES / MANDATES) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {isStartup ? (
                <><Presentation size={18} className="text-violet-400" /> Active Pitch Decks</>
              ) : (
                <><Target size={18} className="text-cyan-400" /> Capital Mandates (Bids)</>
              )}
            </h3>
          </div>

          {isStartup ? (
            pitchDecks.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-white/10 bg-white/[0.02] rounded-3xl">
                <p className="text-sm text-slate-500">No active pitch decks published yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pitchDecks.map((deck) => (
                  <div key={deck.id} className="trionn-glass-card rounded-2xl border border-white/5 p-5 space-y-3 shadow-lg hover:border-violet-500/40 transition">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {deck.stage || "Pre-Seed"}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ${deck.funding_goal?.toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-white line-clamp-1">{deck.title || "Untitled Pitch"}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{deck.elevator_pitch}</p>
                    <Link href={`/startup/${deck.id}/pitch`} className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-bold text-white rounded-xl transition border border-white/5">
                      <Eye size={14} /> View Pitch
                    </Link>
                  </div>
                ))}
              </div>
            )
          ) : (
            bidDecks.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-white/10 bg-white/[0.02] rounded-3xl">
                <p className="text-sm text-slate-500">No active capital mandates published yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bidDecks.map((bid) => (
                  <div key={bid.id} className="trionn-glass-card rounded-2xl border border-white/5 p-5 space-y-3 shadow-lg hover:border-cyan-500/40 transition">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {bid.status}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        Alloc: ${bid.max_allocation?.toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-white line-clamp-1">{bid.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{bid.thesis}</p>
                    <Link href={`/bids/${bid.id}`} className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-bold text-white rounded-xl transition border border-white/5">
                      <Eye size={14} /> View Mandate
                    </Link>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* RECENT ARENA ACTIVITY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className={`text-${themeColor}-400`} /> Recent Arena Activity
            </h3>
          </div>

          <div className="space-y-4">
            {recentPosts.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-white/10 bg-white/[0.02] rounded-3xl">
                <p className="text-sm text-slate-500">This user hasn't posted any updates to the Arena Feed yet.</p>
              </div>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="trionn-glass-card rounded-2xl border border-white/5 p-5 space-y-3 shadow-lg hover:border-white/10 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full bg-gradient-to-br from-${themeColor}-400 to-violet-500 flex items-center justify-center font-bold text-black text-[10px] uppercase`}>
                        {displayName.slice(0, 2)}
                      </div>
                      <span className="text-xs font-bold text-white">{displayName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{post.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}