"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import { motion } from "framer-motion";
import { ShieldCheck, Target, Zap, Globe, Sparkles, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative overflow-hidden">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-6xl w-full relative z-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          <div className="flex justify-center">
            <BetaBadge variant="pill" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Redefining How
            <span className="block bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Capital & Innovation Align
            </span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed">
            Gestalt ARENA is a next-generation window-shopping matchmaking marketplace designed for founders, angel investors, venture funds, and strategic capital allocators.
          </p>
        </motion.div>

        {/* Pillars / Values Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Window-Shopping Discovery",
              desc: "Browse unconstrained investor portfolios and startup pitch cards without paywalls or forced upfront registrations.",
              color: "text-cyan-400",
              border: "border-cyan-500/20",
            },
            {
              icon: ShieldCheck,
              title: "Verified Matchmaking",
              desc: "Tiered verification protocols ensuring verified liquidity for investors and verified traction for founding teams.",
              color: "text-violet-400",
              border: "border-violet-500/20",
            },
            {
              icon: Zap,
              title: "TRIONN-Powered Experience",
              desc: "Ultra-fast, dark cinematic interface designed for modern web standards, deep-tech research, and frictionless networking.",
              color: "text-pink-400",
              border: "border-pink-500/20",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`trionn-glass-card rounded-3xl p-8 border ${item.border}`}
              >
                <div className={`p-4 rounded-2xl bg-white/5 w-fit ${item.color} mb-6`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Mission Statement Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 trionn-glass-card rounded-3xl border border-white/10 p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-white/5">
            <Globe size={180} />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Sparkles size={16} /> Our Core Philosophy
            </span>
            <h2 className="text-3xl font-black text-white">
              Empowering Founders & Investors Globally
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              We believe early-stage venture building shouldn't be trapped behind closed doors or opaque networks. Gestalt ARENA creates an open digital ecosystem where innovation speaks for itself.
            </p>
          </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}
