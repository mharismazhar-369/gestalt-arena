"use client";

import { useState } from "react";
import { useUserTier, TierType } from "@/components/context/UserTierContext";
import { Crown, Sparkles, ShieldCheck, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TierSwitcherBar() {
  const { tier, setTier, capabilities, postsToday, articlesToday } = useUserTier();
  const [isExpanded, setIsExpanded] = useState(false);

  const tiers: { id: TierType; label: string; icon: typeof Crown }[] = [
    { id: "freemium", label: "Freemium (20 posts / 500 ch)", icon: Lock },
    { id: "gold", label: "Gold (50 posts / 1000 ch / $50k)", icon: ShieldCheck },
    { id: "platinum", label: "Platinum (Max / Unlimited)", icon: Crown },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="mb-3 w-80 rounded-2xl border border-white/15 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Sparkles size={14} /> Sandbox Tier Switcher
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-white/10">
                Frontend Simulator
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Toggle tiers to test character limits, daily post caps, and article publishing lockouts in real time.
            </p>

            <div className="space-y-2">
              {tiers.map((t) => {
                const Icon = t.icon;
                const isActive = tier === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/50 text-white shadow-lg"
                        : "bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={isActive ? "text-cyan-400" : "text-slate-400"} />
                      <span>{t.label}</span>
                    </div>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Active Limit:</span>
                <span className="font-bold text-white">{capabilities.maxCharsPerPost} chars / post</span>
              </div>
              <div className="flex justify-between">
                <span>Posts Today:</span>
                <span className="font-bold text-white">{postsToday} / {capabilities.maxPostsPer24h >= 9999 ? "∞" : capabilities.maxPostsPer24h}</span>
              </div>
              <div className="flex justify-between">
                <span>Articles Today:</span>
                <span className="font-bold text-white">{articlesToday} / {capabilities.maxArticlesPerDay >= 9999 ? "∞" : capabilities.maxArticlesPerDay}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 rounded-full border border-cyan-400/40 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-xl transition hover:border-cyan-400 hover:scale-105 hover:shadow-cyan-500/20"
      >
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-cyan-400">Tier Mode:</span>
        <span className="capitalize">{capabilities.name}</span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </div>
  );
}
