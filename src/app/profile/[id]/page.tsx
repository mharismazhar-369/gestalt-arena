"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import { UserPlus, UserCheck, ShieldCheck, MapPin, DollarSign, Building2, Rocket, Globe, Share2, Sparkles, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicProfileStudyPage() {
  const params = useParams();
  const profileId = params?.id ? String(params.id) : "investor-study";
  const [following, setFollowing] = useState(false);

  // Structural details for window-shopping study layout
  const profileData = {
    name: "Strategic Capital Partner",
    role: "Angel Syndicate Lead / VC",
    location: "San Francisco, CA",
    investmentRange: "$25,000 – $250,000",
    tier: "platinum",
    verified: true,
    bio: "Active early-stage investor supporting scalable technology, autonomous agent SDKs, deep-tech research, and B2B SaaS founders with growth capital and operator mentorship.",
    sectors: ["Fintech", "AI/ML", "B2B SaaS", "Developer Tools"],
    stages: ["Pre-Seed", "Seed Stage", "Series A"],
    portfolioCount: 18,
    website: "https://gestaltarena.com",
  };

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
                {profileData.name.slice(0, 2)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white">{profileData.name}</h1>
                  {profileData.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      <ShieldCheck size={12} /> Verified Profile
                    </span>
                  )}
                  <BetaBadge variant="pill" />
                </div>

                <p className="text-xs text-cyan-400 font-semibold">{profileData.role}</p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-cyan-400" /> {profileData.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building2 size={13} className="text-violet-400" /> {profileData.portfolioCount} Portfolio Deals
                  </span>
                </div>
              </div>
            </div>

            {/* Stylized Follow / Add to Network Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFollowing(!following)}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition shadow-xl ${
                  following
                    ? "bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700"
                    : "bg-gradient-to-r from-cyan-400 to-violet-500 text-black hover:scale-105 shadow-cyan-500/20"
                }`}
              >
                {following ? (
                  <>
                    <UserCheck size={16} className="text-emerald-400" /> Connected in Network
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
          </div>

          {/* Profile Bio */}
          <div className="border-t border-white/10 pt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overview & Investment Mandate
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {profileData.bio}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {profileData.sectors.map((sec) => (
              <span key={sec} className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                {sec}
              </span>
            ))}
            {profileData.stages.map((stg) => (
              <span key={stg} className="rounded-xl border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200">
                {stg}
              </span>
            ))}
          </div>
        </div>

        {/* Investment Range & Activity Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Investment Range</span>
            <p className="text-2xl font-black text-cyan-300 flex items-center gap-1">
              <DollarSign size={20} className="-mr-1 text-cyan-400" /> {profileData.investmentRange}
            </p>
          </div>

          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Platform Membership</span>
            <p className="text-xl font-bold text-violet-300 capitalize flex items-center gap-1.5">
              <Sparkles size={18} className="text-violet-400" /> {profileData.tier} Tier
            </p>
          </div>

          <div className="trionn-glass-card rounded-3xl border border-white/10 p-6 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Status</span>
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
