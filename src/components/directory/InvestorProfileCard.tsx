"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, MapPin, DollarSign, ShieldCheck, Tag, ArrowUpRight, Sparkles, Award } from "lucide-react";

export interface Investor {
  id?: string;
  name?: string;
  type?: string;
  description?: string;
  location?: string;
  investmentRange?: string;
  stageFocus?: string[];
  sectors?: string[];
  portfolioCount?: number;
  tier?: "freemium" | "gold" | "platinum";
  verified?: boolean;
}

interface InvestorProfileCardProps {
  investor?: Investor;
}

export default function InvestorProfileCard({ investor }: InvestorProfileCardProps) {
  // If no investor prop is passed, render a sleek structural layout placeholder
  const name = investor?.name || "Strategic Capital Partner";
  const type = investor?.type || "VC Fund";
  const description = investor?.description || "Active early-stage investor supporting scalable technology, SaaS, and deep-tech founders with capital and global strategic guidance.";
  const location = investor?.location || "Global Network";
  const range = investor?.investmentRange || "$25,000 – $250,000";
  const stages = investor?.stageFocus || ["Seed", "Pre-Series A"];
  const sectors = investor?.sectors || ["Fintech", "AI/ML", "B2B SaaS"];
  const portfolioCount = investor?.portfolioCount ?? 12;
  const tier = investor?.tier || "gold";
  const isVerified = investor?.verified ?? true;

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
      {/* Background Subtle Ambient Glow on Hover */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/25 transition duration-500 pointer-events-none" />

      <div>
        {/* Top Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
              {type}
            </span>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                <ShieldCheck size={12} /> Verified
              </span>
            )}
          </div>

          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${tierColors[tier]}`}>
            {tier} Tier
          </span>
        </div>

        {/* Investor Name & Location */}
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition flex items-center justify-between">
          <span>{name}</span>
          <ArrowUpRight size={18} className="text-slate-500 group-hover:text-cyan-400 transition transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin size={13} className="text-cyan-400" /> {location}
          <span className="text-slate-600">•</span>
          <Building2 size={13} className="text-violet-400" /> {portfolioCount} Investments
        </p>

        {/* Bio / Description */}
        <p className="mt-4 text-xs leading-relaxed text-slate-300 line-clamp-3">
          {description}
        </p>

        {/* Hover-Reveal Tag Chips */}
        <div className="mt-4 flex flex-wrap gap-1.5 pt-2">
          {sectors.map((sector) => (
            <span
              key={sector}
              className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition group-hover:border-cyan-400/30 group-hover:bg-cyan-400/5 group-hover:text-cyan-200"
            >
              {sector}
            </span>
          ))}
          {stages.map((stage) => (
            <span
              key={stage}
              className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400 transition group-hover:border-violet-400/30 group-hover:text-violet-300"
            >
              {stage}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Details & Action Button */}
      <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
            Ticket Size Range
          </span>
          <span className="text-sm font-extrabold text-white flex items-center gap-1">
            <DollarSign size={14} className="text-cyan-400 -mr-1" /> {range}
          </span>
        </div>

        <Link
          href="/login"
          className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400 hover:text-black shadow-lg shadow-cyan-500/10"
        >
          Connect Profile
        </Link>
      </div>
    </motion.div>
  );
}
