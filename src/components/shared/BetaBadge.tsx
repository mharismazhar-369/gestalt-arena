"use client";

import { Sparkles } from "lucide-react";

interface BetaBadgeProps {
  variant?: "pill" | "banner";
  className?: string;
}

export default function BetaBadge({ variant = "pill", className = "" }: BetaBadgeProps) {
  if (variant === "banner") {
    return (
      <div className={`w-full border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-violet-950/30 to-slate-950/40 px-4 py-1.5 text-center text-xs font-semibold backdrop-blur-md ${className}`}>
        <div className="flex items-center justify-center gap-2 text-cyan-300">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <Sparkles size={13} className="text-cyan-400" />
          <span>Gestalt Arena Platform is currently in <strong className="text-white underline decoration-cyan-400/50">Beta-Testing Phase v1.0</strong></span>
          <span className="hidden md:inline text-slate-400">— Feedback & Early Partner Access Live</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-cyan-300 backdrop-blur-xl shadow-lg shadow-cyan-500/5 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
      </span>
      <span className="uppercase tracking-widest text-cyan-200">Beta Phase</span>
    </div>
  );
}
