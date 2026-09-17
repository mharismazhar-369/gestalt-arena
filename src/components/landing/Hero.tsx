"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import {
  BriefcaseBusiness,
  ChevronRight,
  Zap,
  Sparkles,
} from "lucide-react";
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
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Hero() {
  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 text-center pt-24 overflow-hidden">
      {/* Background Aether Canvas Animation */}
      <Background />

      {/* Decorative subtle glowing orb behind the hero content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] sm:w-[80vw] sm:h-[80vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-emerald-100/30 via-indigo-100/30 to-purple-100/30 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 p-6 sm:p-10 md:p-14 w-full max-w-5xl rounded-3xl bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] mx-auto"
      >
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -inset-[100%] animate-[spin_20s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(192,132,252,0.1)_0%,rgba(52,211,153,0.1)_50%,rgba(192,132,252,0.1)_100%)] opacity-50" />
          <div className="absolute inset-[1px] bg-white/70 rounded-[23px] backdrop-blur-xl" />
        </div>

        <div className="relative z-20">
          {/* Welcome Badge */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-5 md:mb-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100/80 bg-white/90 px-4 py-2 md:px-6 md:py-2.5 shadow-sm transition-transform hover:scale-105 cursor-default max-w-full overflow-hidden">
              <Sparkles
                size={16}
                className="text-amber-500 animate-pulse shrink-0"
              />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-indigo-900 truncate">
                Welcome to Gestalt Arena
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] text-slate-900 tracking-tighter"
          >
            Where{" "}
            <span className="relative whitespace-nowrap">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 drop-shadow-sm">
                Capital
              </span>
            </span>{" "}
            Meets{" "}
            <span className="relative whitespace-nowrap">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm">
                Execution
              </span>
            </span>
          </motion.h1>

          {/* Core Action Statement */}
          <motion.div
            variants={itemVariants}
            className="mt-4 md:mt-5"
          >
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 tracking-wide">
              Discover. Evaluate. Connect. Negotiate.
            </h2>
          </motion.div>

          {/* Main Positioning */}
          <motion.div
            variants={itemVariants}
            className="mt-5 md:mt-7 mx-auto max-w-3xl text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed"
          >
            <p>
              <span className="font-semibold text-slate-800">
                The world doesn&apos;t need another place to scroll.
              </span>{" "}
              It needs a place where possibilities can find each other. Gestalt Arena
              is a global arena for people with ideas, skills, businesses, inventions,
              solutions, ambitions, and those looking for them. A doctor with an idea,
              an engineer solving a problem, an inventor looking for a path forward, a
              business seeking expertise, a researcher seeking collaboration, an
              entrepreneur building something real, or an investor looking for their
              next opportunity.
            </p>

            <p className="mt-3">
              <span className="font-semibold text-slate-700">
                Showcase what you have. Express what you need. Discover what you
                didn&apos;t know you were looking for.
              </span>{" "}
              No endless feeds. No forced networking. No bidding wars. No crowdfunding.
              <span className="font-semibold text-slate-800">
                {" "}Just people, capabilities, opportunities and capital, brought closer
                together by intelligent discovery and matching.
              </span>
            </p>
          </motion.div>

          {/* Brand Closing Statement */}
          <motion.div
            variants={itemVariants}
            className="mt-6 md:mt-8"
          >
            <p className="text-sm sm:text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600">
              Where the world&apos;s possibilities meet.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-7 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              href="/register?role=investor"
              className="group relative inline-flex h-12 md:h-14 w-full sm:w-auto min-w-[220px] items-center justify-center overflow-hidden rounded-full bg-slate-900 px-6 md:px-8 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(15,23,42,0.22)] active:translate-y-0 active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <span className="relative flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider">
                <BriefcaseBusiness
                  size={18}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                Step in as an Investor
                <ChevronRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>

            <Link
              href="/register?role=startup"
              className="group relative inline-flex h-12 md:h-14 w-full sm:w-auto min-w-[220px] items-center justify-center overflow-hidden rounded-full bg-white px-6 md:px-8 font-bold text-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(15,23,42,0.15)] active:translate-y-0 active:scale-[0.98] border border-slate-200 hover:border-indigo-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <span className="relative flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider">
                <Zap
                  size={18}
                  className="text-indigo-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                />
                Step in as a Startup
                <ChevronRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}