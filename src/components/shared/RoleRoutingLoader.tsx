"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Compass } from "lucide-react";

interface RoleRoutingLoaderProps {
  message?: string;
  subtext?: string;
}

export default function RoleRoutingLoader({
  message = "Resolving Profile Credentials...",
  subtext = "Connecting to Gestalt Arena role protocol...",
}: RoleRoutingLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#02040a] text-white trionn-grid-bg px-6">
      
      {/* Background Ambient Glow */}
      <div className="absolute h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute h-96 w-96 rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
        
        {/* Dual Spinning Orbital Rings */}
        <div className="relative flex items-center justify-center h-24 w-24">
          {/* Outer Cyan Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400/30 trionn-glow-cyan"
          />

          {/* Inner Violet Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400 border-b-violet-400/30 trionn-glow-violet"
          />

          {/* Center Brand Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 text-cyan-400 shadow-xl">
            <Sparkles size={22} className="animate-pulse" />
          </div>
        </div>

        {/* Message & Status Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-wide flex items-center justify-center gap-2">
            <span>{message}</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {subtext}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-48 h-1 rounded-full bg-slate-900 overflow-hidden border border-white/5">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-full bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400"
          />
        </div>

      </div>
    </div>
  );
}
