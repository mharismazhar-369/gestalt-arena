"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BriefcaseBusiness, Rocket } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl text-6xl font-black leading-tight text-white md:text-8xl"
      >
        Where
        <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
          {" "}Investors{" "}
        </span>
        Meet
        <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          {" "}Startups
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 max-w-3xl text-lg leading-8 text-zinc-300 md:text-xl"
      >
        Browse freely. Connect securely.
        Discover startups, founders, entrepreneurs,
        angel investors, venture capital firms,
        seed investors and strategic partners
        from around the world.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-14 flex flex-col gap-6 md:flex-row"
      >

        <Link
          href="/investor"
          className="group flex items-center gap-3 rounded-2xl border border-cyan-400 bg-cyan-400 px-10 py-5 text-lg font-bold text-black transition hover:scale-105"
        >
          <BriefcaseBusiness size={24} />

          Investor

        </Link>

        <Link
          href="/startup"
          className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-10 py-5 text-lg font-bold text-white backdrop-blur-xl transition hover:scale-105 hover:border-cyan-400"
        >
          <Rocket size={24} />

          Startup

        </Link>

      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 flex flex-wrap justify-center gap-5"
      >

        <div className="rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">

          🌍 Global

        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">

          🔒 Secure Messaging

        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">

          🚀 Free Browsing

        </div>

      </motion.div>

    </section>
  );
}