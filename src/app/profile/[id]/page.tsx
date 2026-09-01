"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useChat } from "@/components/context/ChatContext";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";
import {
  UserPlus, UserCheck, ShieldCheck, MapPin, DollarSign, Building2,
  Share2, Users, MessageSquare, Edit3, Save, X, Globe, Link as LinkIcon,
  Briefcase, TrendingUp, Calendar, FileText,
  Plane
} from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const profileId = params?.id ? String(params.id) : "";
  const { session } = useAuth();
  const { openChat } = useChat();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [subProfile, setSubProfile] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: "",
    bio: "",
    city: "",
    country: "",
    linkedin_url: "",
    website: "",
    industry: "",
  });

  const isOwnProfile = session?.user?.id === profileId;

  useEffect(() => {
    if (!profileId) return;

    async function fetchProfileData() {
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

      if (coreData.role === "startup") {
        const { data: startupData } = await supabase.from("startup_profiles").select("*").eq("profile_id", profileId).single();
        if (startupData) setSubProfile(startupData);
      } else if (coreData.role === "investor") {
        const { data: investorData } = await supabase.from("investor_profiles").select("*").eq("profile_id", profileId).single();
        if (investorData) setSubProfile(investorData);
      }

      const { data: postsData } = await supabase
        .from("posts")
        .select("id, content, created_at")
        .eq("author_id", profileId)
        .order("created_at", { ascending: false })
        .limit(3);
      if (postsData) setRecentPosts(postsData);

      const { count } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profileId);
      setFollowerCount(count || 0);

      if (session?.user) {
        const { data: followData } = await supabase.from("follows").select("*").eq("follower_id", session.user.id).eq("following_id", profileId).single();
        if (followData) setFollowing(true);
      }

      setEditForm({
        nickname: coreData.nickname || coreData.company_name || "",
        bio: coreData.bio || coreData.elevator_pitch || "",
        city: coreData.city || "",
        country: coreData.country || "",
        linkedin_url: coreData.linkedin_url || "",
        website: "",
        industry: coreData.industries_of_interest?.[0] || "",
      });

      setLoading(false);
    }

    fetchProfileData();
  }, [profileId, session]);

  useEffect(() => {
    if (subProfile) {
      setEditForm((prev) => ({
        ...prev,
        website: subProfile.website || "",
        industry: subProfile.industry || prev.industry,
      }));
    }
  }, [subProfile]);

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

  const handleSaveProfile = async () => {
    await supabase.from("profiles").update({
      nickname: editForm.nickname,
      bio: editForm.bio,
      city: editForm.city,
      country: editForm.country,
      linkedin_url: editForm.linkedin_url,
    }).eq("id", profileId);

    if (profile.role === "startup") {
      await supabase.from("startup_profiles").upsert({
        profile_id: profileId,
        website: editForm.website,
        industry: editForm.industry,
      });
    } else if (profile.role === "investor") {
      await supabase.from("investor_profiles").upsert({
        profile_id: profileId,
        website: editForm.website,
      });
    }

    setProfile({ ...profile, nickname: editForm.nickname, bio: editForm.bio, city: editForm.city, country: editForm.country, linkedin_url: editForm.linkedin_url });
    setSubProfile({ ...subProfile, website: editForm.website, industry: editForm.industry });
    setIsEditing(false);
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

      <main className="pt-32 pb-24 px-6 mx-auto max-w-6xl w-full relative z-10 space-y-8">

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
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.nickname}
                      onChange={e => setEditForm({ ...editForm, nickname: e.target.value })}
                      className="bg-slate-900 border border-white/20 rounded-lg px-3 py-1 text-xl font-bold text-white focus:border-cyan-400 focus:outline-none"
                    />
                  ) : (
                    <h1 className="text-3xl md:text-4xl font-black text-white">{displayName}</h1>
                  )}
                  {profile.profile_completed && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                  <BetaBadge variant="pill" />
                </div>

                <p className={`text-sm text-${themeColor}-400 font-bold capitalize`}>{displayRole}</p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className={`text-${themeColor}-400`} />
                    {isEditing ? (
                      <input type="text" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} placeholder="City" className="bg-slate-900 border border-white/20 rounded md w-24 px-2 py-0.5 outline-none" />
                    ) : (
                      profile.city ? `${profile.city}, ${profile.country || ""}` : "Global Network"
                    )}
                  </span>
                  <span>•</span>
                  <span className={`flex items-center gap-1 font-bold text-${isStartup ? 'pink' : 'violet'}-300`}>
                    <Users size={14} /> {followerCount} Followers
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isOwnProfile ? (
                isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="p-3 rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition">
                      <X size={16} />
                    </button>
                    <button onClick={handleSaveProfile} className="flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition shadow-xl bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105">
                      <Save size={16} /> Save Changes
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition shadow-xl border border-${themeColor}-400/30 bg-${themeColor}-500/10 text-${themeColor}-300 hover:bg-${themeColor}-500/20`}>
                    <Edit3 size={16} /> Edit Public Profile
                  </button>
                )
              ) : (
                <>
                  <button onClick={toggleFollow} className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition shadow-xl ${following ? "bg-slate-800 text-slate-300 border border-white/10" : `bg-gradient-to-r from-${themeColor}-400 to-${isStartup ? 'pink' : 'violet'}-500 text-black hover:scale-105`}`}>
                    {following ? <><UserCheck size={16} className="text-emerald-400" /> In Network</> : <><UserPlus size={16} /> Add to Network</>}
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
            {isEditing ? (
              <textarea
                rows={3}
                value={editForm.bio}
                onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full bg-slate-900 border border-white/20 rounded-xl p-3 text-sm text-white focus:border-cyan-400 focus:outline-none resize-none"
              />
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed max-w-4xl whitespace-pre-line">
                {profile.bio || profile.elevator_pitch || "No overview provided yet."}
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="space-y-6">
            <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-6 shadow-xl">
              <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">Key Metrics</h3>

              <div className="space-y-4">
                {isStartup ? (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Industry / Sector</span>
                      {isEditing ? (
                        <input type="text" value={editForm.industry} onChange={e => setEditForm({ ...editForm, industry: e.target.value })} className="bg-slate-900 border border-white/20 rounded-md px-2 py-1 text-xs w-full text-white" />
                      ) : (
                        <span className="text-sm font-semibold text-white flex items-center gap-2"><Briefcase size={14} className="text-pink-400" /> {subProfile?.industry || "Unspecified"}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Business Model</span>
                      <span className="text-sm font-semibold text-white flex items-center gap-2"><TrendingUp size={14} className="text-emerald-400" /> {subProfile?.business_model || "B2B SaaS"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Founded</span>
                      <span className="text-sm font-semibold text-white flex items-center gap-2"><Calendar size={14} className="text-amber-400" /> {subProfile?.founded_year || "Recently Established"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Target Ticket Size</span>
                      <span className="text-sm font-semibold text-white flex items-center gap-2"><DollarSign size={14} className="text-emerald-400" /> {profile.ticket_size || "Flexible"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Firm Type</span>
                      <span className="text-sm font-semibold text-white flex items-center gap-2"><Building2 size={14} className="text-violet-400" /> {subProfile?.firm_type || "Venture Capital"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">Official Links</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><Globe size={12} /> Website</span>
                  {isEditing ? (
                    <input type="url" value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} className="bg-slate-900 border border-white/20 rounded-md px-2 py-1 text-xs w-full text-white" />
                  ) : (
                    <a href={subProfile?.website || "#"} target="_blank" className="text-xs text-cyan-400 hover:underline truncate">{subProfile?.website || "Not provided"}</a>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><LinkIcon size={12} /> LinkedIn</span>
                  {isEditing ? (
                    <input type="url" value={editForm.linkedin_url} onChange={e => setEditForm({ ...editForm, linkedin_url: e.target.value })} className="bg-slate-900 border border-white/20 rounded-md px-2 py-1 text-xs w-full text-white" />
                  ) : (
                    <a href={profile.linkedin_url || "#"} target="_blank" className="text-xs text-cyan-400 hover:underline truncate">{profile.linkedin_url || "Not provided"}</a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={18} className={`text-${themeColor}-400`} /> Recent Arena Activity
              </h3>
            </div>

            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <div className="text-center p-12 border border-white/5 bg-white/[0.02] rounded-3xl">
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

        </div>
      </main>

      <Footer />
    </div>
  );
}