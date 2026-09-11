"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { BriefcaseBusiness, ChevronRight, Zap, Sparkles } from "lucide-react";
import Background from "./Background";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Hero() {
  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center pt-24 overflow-hidden">
      {/* Background Aether Canvas Animation */}
      <Background />

      {/* Decorative subtle glowing orb behind the hero content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-emerald-100/30 via-indigo-100/30 to-purple-100/30 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 p-10 md:p-16 max-w-5xl rounded-3xl bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]"
      >
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -inset-[100%] animate-[spin_20s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(192,132,252,0.1)_0%,rgba(52,211,153,0.1)_50%,rgba(192,132,252,0.1)_100%)] opacity-50" />
          <div className="absolute inset-[1px] bg-white/70 rounded-[23px] backdrop-blur-xl" />
        </div>

        <div className="relative z-20">
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100/80 bg-white/90 px-6 py-2.5 shadow-sm transition-transform hover:scale-105 cursor-default">
              <Sparkles size={16} className="text-amber-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-900">
                Welcome to Gestalt Arena
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black leading-tight text-slate-900 tracking-tighter"
          >
            Where
            <span className="relative whitespace-nowrap mx-3">
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 drop-shadow-sm">Capital</span>
            </span>
            Meets
            <br className="hidden md:block" />
            <span className="relative whitespace-nowrap">
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm">Execution</span>
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 mx-auto max-w-2xl text-base md:text-lg text-slate-600 font-medium leading-relaxed"
          >
            A visionary platform uniting Innovators and Investors. We bridge the gap, helping backers find the best Business Models showcased by Pioneers needing capital from Digital Startups to Real-World experts.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/register?role=investor" className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center overflow-hidden rounded-full bg-slate-900 px-8 font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.25)] border border-slate-800">
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
              <span className="relative flex items-center gap-2 text-sm uppercase tracking-wider">
                <BriefcaseBusiness size={18} /> Enter as Investor <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link href="/register?role=startup" className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center overflow-hidden rounded-full bg-white px-8 font-bold text-indigo-600 transition-all hover:scale-105 active:scale-95 border border-indigo-200 shadow-[0_10px_20px_rgba(99,102,241,0.08)] hover:shadow-[0_15px_30px_rgba(99,102,241,0.15)] hover:border-indigo-300">
              <span className="absolute inset-0 bg-indigo-50/50 transition-colors group-hover:bg-indigo-100/50" />
              <span className="relative flex items-center gap-2 text-sm uppercase tracking-wider">
                <Zap size={18} className="text-indigo-500" /> Enter As Startup
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}