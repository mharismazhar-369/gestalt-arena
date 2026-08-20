"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Rocket, MapPin, Users, TrendingUp, ShieldCheck, ArrowUpRight, Target } from "lucide-react";

export interface Startup {
  id?: string;
  name?: string;
  tagline?: string;
  industry?: string;
  stage?: string;
  requiredFunding?: string;
  valuation?: string;
  location?: string;
  teamSize?: number;
  pitchSummary?: string;
  tags?: string[];
  verified?: boolean;
  tier?: "freemium" | "gold" | "platinum";
}

interface StartupProfileCardProps {
  startup?: Startup;
}

export default function StartupProfileCard({ startup }: StartupProfileCardProps) {
  // If no startup prop is passed, render a sleek structural layout placeholder
  const name = startup?.name || "DeepTech AI Platform";
  const tagline = startup?.tagline || "Autonomous agent architecture for enterprise workflows";
  const industry = startup?.industry || "Artificial Intelligence";
  const stage = startup?.stage || "Seed Stage";
  const requiredFunding = startup?.requiredFunding || "$150,000";
  const valuation = startup?.valuation || "$2.5M Valuation";
  const location = startup?.location || "San Francisco, CA";
  const teamSize = startup?.teamSize ?? 5;
  const pitchSummary = startup?.pitchSummary || "Building next-generation agent orchestration SDKs that automate complex multi-phase cloud infrastructure and business analytics.";
  const tags = startup?.tags || ["GenAI", "Autonomous Agents", "Cloud Architecture"];
  const isVerified = startup?.verified ?? true;
  const tier = startup?.tier || "gold";

  const tierColors = {
    freemium: "text-slate-400 border-slate-500/30 bg-slate-500/10",
    gold: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    platinum: "text-violet-400 border-violet-500/50 bg-violet-500/10",
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-3xl trionn-glass-card border border-white/10 p-6 flex flex-col justify-between overflow-hidden shadow-xl"
    >
      {/* Ambient Gradient Blur */}
      <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl group-hover:bg-violet-500/25 transition duration-500 pointer-events-none" />

      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300 flex items-center gap-1.5">
              <Rocket size={13} /> {industry}
            </span>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                <ShieldCheck size={12} /> Verified Deck
              </span>
            )}
          </div>

          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${tierColors[tier]}`}>
            {tier} Tier
          </span>
        </div>

        {/* Startup Name & Tagline */}
        <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition flex items-center justify-between">
          <span>{name}</span>
          <ArrowUpRight size={18} className="text-slate-500 group-hover:text-violet-400 transition transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </h3>

        <p className="mt-1 text-xs font-semibold text-cyan-400 line-clamp-1">
          {tagline}
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={13} className="text-cyan-400" /> {location}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <Users size={13} className="text-violet-400" /> {teamSize} Members
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-bold">{stage}</span>
        </div>

        {/* Pitch Summary */}
        <p className="mt-4 text-xs leading-relaxed text-slate-300 line-clamp-3">
          {pitchSummary}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5 pt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition group-hover:border-violet-400/30 group-hover:bg-violet-400/5 group-hover:text-violet-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Ask & Valuation */}
      <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
            Target Raise Ask
          </span>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-cyan-300">{requiredFunding}</span>
            <span className="text-[10px] text-slate-400">({valuation})</span>
          </div>
        </div>

        <Link
          href="/login"
          className="rounded-xl border border-violet-400/40 bg-violet-400/10 px-4 py-2 text-xs font-bold text-violet-300 transition hover:bg-violet-500 hover:text-white shadow-lg shadow-violet-500/10"
        >
          View Pitch
        </Link>
      </div>
    </motion.div>
  );
}
