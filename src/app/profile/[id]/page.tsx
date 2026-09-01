"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import { UserPlus, UserCheck, ShieldCheck, MapPin, DollarSign, Building2, Share2, Sparkles, Users } from "lucide-react";
import RoleRoutingLoader from "@/components/shared/RoleRoutingLoader";

export default function PublicProfilePage() {
  const params = useParams();
  const profileId = params?.id ? String(params.id) : null;
  const { session } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!profileId) return;

    async function fetchProfileData() {
      // 1. Fetch Target User Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (profileData) setProfile(profileData);

      // 2. Fetch Network Stats (Follower Count)
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profileId);

      setFollowerCount(count || 0);

      // 3. Check if current logged-in user is already following this profile
      if (session?.user) {
        const { data: followData } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", session.user.id)
          .eq("following_id", profileId)
          .single();

        if (followData) setFollowing(true);
      }

      setLoading(false);
    }

    fetchProfileData();
  }, [profileId, session]);

  const toggleFollow = async () => {
    if (!session?.user) {
      alert("You must be logged in to add to your network.");
      return;
    }

    // Prevent following yourself
    if (session.user.id === profileId) return;

    if (following) {
      setFollowing(false);
      setFollowerCount((prev) => prev - 1);
      await supabase
        .from("follows")
        .delete()
        .match({ follower_id: session.user.id, following_id: profileId });
    } else {
      setFollowing(true);
      setFollowerCount((prev) => prev + 1);
      await supabase
        .from("follows")
        .insert({ follower_id: session.user.id, following_id: profileId });

      // Trigger Global Notification
      await supabase.from("notifications").insert({
        user_id: profileId,
        actor_id: session.user.id,
        type: "follow",
        message: "added you to their network.",
      });
    }
  };

  if (loading) return <RoleRoutingLoader message="Loading Profile Data..." />;

  if (!profile) return (
    <div className="min-h-screen bg-[#02040a] text-white flex items-center justify-center trionn-grid-bg">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-300">Profile Not Found</h2>
        <p className="text-slate-500">The user you are looking for does not exist or has incomplete registration.</p>
      </div>
    </div>
  );

  // Map dynamic fields
  const displayName = profile.nickname || profile.company_name || "Arena Member";
  const displayRole = profile.role === "investor" ? "Investor / Capital Partner" : "Startup Founder";
  const displayLocation = profile.city ? `${profile.city}, ${profile.state || ""}` : "Global Network";
  const displayBio = profile.bio || profile.investment_thesis || profile.elevator_pitch || "No overview provided.";
  const displayTags = profile.industries_of_interest || profile.preferred_stages || ["Technology"];
  const isOwnProfile = session?.user?.id === profileId;

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-5xl w-full relative z-10 space-y-8">

        {/* Profile Header Card */}
        <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 md:p-10 relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 p-8 text-cyan-500/5 pointer-events-none">
            <Building2 size={240} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 text-black font-black text-2xl uppercase shadow-xl">
                {displayName.slice(0, 2)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white">{displayName}</h1>
                  {profile.profile_completed && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                  <BetaBadge variant="pill" />
                </div>

                <p className="text-xs text-cyan-400 font-semibold capitalize">{displayRole}</p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-cyan-400" /> {displayLocation}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-violet-300">
                    <Users size={13} /> {followerCount} Followers
                  </span>
                </div>
              </div>
            </div>

            {/* Stylized Follow / Add to Network Button */}
            {!isOwnProfile && (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFollow}
                  className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition shadow-xl ${following
                      ? "bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700"
                      : "bg-gradient-to-r from-cyan-400 to-violet-500 text-black hover:scale-105 shadow-cyan-500/20"
                    }`}
                >
                  {following ? (
                    <>
                      <UserCheck size={16} className="text-emerald-400" /> In Network
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} /> Add to Network
                    </>
                  )}
                </button>

                <button className="p-3 rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition" aria-label="Share">
                  <Share2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Profile Bio */}
          <div className="border-t border-white/10 pt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overview & Mandate
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">
              {displayBio}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {displayTags.map((tag: string) => (
              <span key={tag} className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Investment Range & Activity Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Size / Funding</span>
            <p className="text-2xl font-black text-cyan-300 flex items-center gap-1">
              <DollarSign size={20} className="-mr-1 text-cyan-400" /> {profile.ticket_size || profile.funding_goal || "Flexible"}
            </p>
          </div>

          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Platform Membership</span>
            <p className="text-xl font-bold text-violet-300 capitalize flex items-center gap-1.5">
              <Sparkles size={18} className="text-violet-400" /> Freemium Tier
            </p>
          </div>

          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">System Verification</span>
            <p className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck size={18} /> Credentials Active
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}