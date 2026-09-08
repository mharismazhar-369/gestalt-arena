"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import { motion } from "framer-motion";

export default function AboutPage() {
  const pillars = [
    {
      number: "01",
      title: "Discovery Without Barriers",
      desc: "Browse unconstrained investor portfolios and startup pitch decks without paywalls or forced upfront registrations. True innovation must speak for itself.",
    },
    {
      number: "02",
      title: "The Friction of Capital",
      desc: "Traditional fundraising is trapped behind closed doors, opaque networks, and mandatory warm introductions. Founders lose months chasing misaligned capital while investors drown in unfiltered noise.",
    },
    {
      number: "03",
      title: "The Arena Solution",
      desc: "A transparent, high-velocity matchmaking ecosystem. We bypass the gatekeepers by combining tiered verification with direct negotiation rooms, perfectly aligning active liquidity with confirmed traction.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-6xl w-full relative z-10">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-8 max-w-4xl mx-auto"
        >
          <div className="flex justify-center">
            <BetaBadge variant="pill" />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-[var(--secondary)]">
            Redefining How <br />
            <span className="text-[var(--accent)]">Capital & Innovation</span> Align
          </h1>

          <p className="text-[var(--secondary)]/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
            Gestalt ARENA is a next generation matchmaking marketplace explicitly designed for founders, angel investors, venture funds, and strategic capital allocators.
          </p>
        </motion.div>

        {/* Pillars / Values Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {pillars.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="neu-flat-base rounded-3xl p-8 md:p-10 flex flex-col space-y-6 group hover:border-[var(--accent)]/30 transition-all"
            >
              <div className="neu-pressed-base border-transparent shadow-inner w-16 h-16 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-black text-[var(--accent)]">{item.number}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-[var(--secondary)]">{item.title}</h3>
                <p className="text-[var(--secondary)]/70 text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 neu-flat-base rounded-3xl p-10 md:p-16 relative overflow-hidden"
        >
          <div className="relative z-10 max-w-3xl space-y-6 mx-auto text-center">
            <span className="neu-pressed-base border-transparent shadow-inner px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--accent)] inline-block">
              Our Core Philosophy
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--secondary)]">
              Empowering Global Markets
            </h2>
            <p className="text-[var(--secondary)]/80 text-base md:text-lg leading-relaxed font-medium">
              We believe early stage venture building should never be trapped behind closed doors or opaque networks. Gestalt ARENA creates an open digital ecosystem where founders can showcase their traction and investors can deploy capital efficiently.
            </p>
          </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}