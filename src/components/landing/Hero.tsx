"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BriefcaseBusiness, ChevronRight, Zap, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center pt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="relative p-8 md:p-16 max-w-5xl rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-white to-transparent blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
              Welcome to Gestalt Arena
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight text-slate-900 tracking-tighter">
            Where
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600"> Capital </span>
            Meets
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Execution</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-8 mx-auto max-w-3xl text-sm md:text-base lg:text-lg text-slate-600 font-semibold leading-relaxed"
        >
          A brand new platform bringing investment opportunities and a space to raise funds. Whether you are an investor, founder, startup, or a company, you can showcase your capital power, idea, product, or services.
          <br className="hidden md:block" /><br className="hidden md:block" />
          Gestalt Arena is not for everyone; it is designed specifically for those who want to thrive in life. We bridge the gap between the two, helping investors find the best business models showcased by visionaries needing capital. We connect people across the globe—not limited to the digital world, but providing grounds for real-world pioneers like doctors, scientists, engineers, robotics experts, and skilled craftsmen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/register?role=investor" className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center overflow-hidden rounded-full bg-slate-900 px-8 font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(15,23,42,0.2)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.3)]">
            <span className="absolute h-0 w-0 rounded-full bg-slate-700 transition-all duration-500 ease-out group-hover:h-56 group-hover:w-56" />
            <span className="relative flex items-center gap-2 text-sm uppercase tracking-wider">
              <BriefcaseBusiness size={18} /> Command Capital <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link href="/register?role=startup" className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center overflow-hidden rounded-full border border-indigo-200 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 font-bold text-white transition-all hover:scale-105 hover:shadow-[0_10px_30px_rgba(79,70,229,0.4)] active:scale-95">
            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
            </span>
            <span className="relative flex items-center gap-2 text-sm uppercase tracking-wider">
              <Zap size={18} className="text-amber-300" /> Ignite Your Vision
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}