"use client";

import { motion } from "framer-motion";
import { Activity, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RoleRoutingLoaderProps {
  message?: string;
  subtext?: string;
  isDenied?: boolean;
  deniedMessage?: string;
  deniedSubtext?: string;
}

export default function RoleRoutingLoader({
  message = "Resolving Profile Credentials...",
  subtext = "Connecting to Gestalt Arena role protocol...",
  isDenied = false,
  deniedMessage = "Access Denied",
  deniedSubtext = "Authentication is required to view this platform layer.",
}: RoleRoutingLoaderProps) {

  const displayMessage = isDenied ? deniedMessage : message;
  const displaySubtext = isDenied ? deniedSubtext : subtext;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC] px-6 backdrop-blur-sm">

      {/* Ambient Digital Glow */}
      <div className={`absolute h-[500px] w-[500px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 ${isDenied ? "bg-rose-500/10" : "bg-indigo-500/10"
        }`} />

      <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-sm">

        {/* Digital HUD Scanner Animation */}
        <div className="relative flex items-center justify-center h-32 w-32">

          {/* HUD Target Brackets */}
          <motion.div
            animate={isDenied ? { scale: 1, opacity: 0.5 } : { scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className={`absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] rounded-tl-xl transition-colors ${isDenied ? 'border-rose-400' : 'border-indigo-400'}`} />
            <div className={`absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] rounded-tr-xl transition-colors ${isDenied ? 'border-rose-400' : 'border-indigo-400'}`} />
            <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] rounded-bl-xl transition-colors ${isDenied ? 'border-rose-400' : 'border-indigo-400'}`} />
            <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] rounded-br-xl transition-colors ${isDenied ? 'border-rose-400' : 'border-indigo-400'}`} />
          </motion.div>

          {/* Rotating Dashed Data Ring */}
          {!isDenied && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border-[2px] border-dashed border-slate-300"
            />
          )}

          {/* Core Node Plate */}
          <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl border overflow-hidden transition-colors duration-500 ${isDenied ? "bg-rose-50 border-rose-200" : "bg-white border-slate-200"
            }`}>
            {isDenied ? (
              <Lock size={28} className="text-rose-600" />
            ) : (
              <>
                <Activity size={28} className="text-indigo-600" />
                {/* Holographic Laser Scan Line */}
                <motion.div
                  animate={{ y: ["-200%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]"
                />
              </>
            )}
          </div>
        </div>

        {/* Text & Status */}
        <div className="space-y-2">
          <h3 className={`text-xl font-black tracking-tight ${isDenied ? "text-rose-600" : "text-slate-900"}`}>
            {displayMessage}
          </h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {displaySubtext}
          </p>
        </div>

        {/* Dynamic Bottom Action: Progress Bar OR Return Button */}
        <div className="h-12 flex items-center justify-center w-full">
          {isDenied ? (
            <Link
              href="/login"
              className="group flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all shadow-[0_5px_15px_rgba(15,23,42,0.2)] hover:scale-105 active:scale-95"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Return to Login
            </Link>
          ) : (
            <div className="w-48 h-1.5 rounded-full bg-slate-200 overflow-hidden shadow-inner">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}