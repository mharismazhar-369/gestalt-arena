"use client";

import { motion } from "framer-motion";
import { Compass, Presentation, Store, Briefcase, Rocket, Cpu } from "lucide-react";
import Background from "./Background";

const features = [
  {
    icon: Compass,
    title: "Smart Discovery",
    description: "Connect intelligently with verified founders, scaling startups, and active capital partners through our curated marketplace.",
    accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Presentation,
    title: "Mandates & Pitch Decks",
    description: "Explore precise investor capital mandates and founder pitch decks designed to align ticket sizes and sector goals instantly.",
    accent: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: Store,
    title: "Emporium Marketplace",
    description: "Showcase and discover commercial software solutions, physical products, enterprise services, and innovative company offerings.",
    accent: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: Briefcase,
    title: "Investor Categories",
    description: "Engage directly with Angel Investors, Venture Capitalists (VCs), Family Offices, Corporate Venture Funds, and Private Equity syndicates.",
    accent: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Rocket,
    title: "Venture Classifications",
    description: "Fundraise or invest across early-stage tech startups, growth-stage SMEs, hardware innovators, and capital-intensive industrial enterprises.",
    accent: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Cpu,
    title: "Real-Life Fundable Industries",
    description: "Secure funding for high-impact sectors including AI, Agriculture, Engineering, Pharmaceuticals, Green Energy, Biotechonology, Robotics, FinTech, and many more.",
    accent: "text-sky-500 bg-sky-500/10 border-sky-500/20",
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-28">
      <Background />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <h2 className="text-4xl md:text-5xl font-black text-[var(--secondary)] tracking-tight">
          Arena Features
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-[var(--secondary)]/70 font-medium leading-relaxed">
          Built to safely connect Entrepreneurs, Founders and Investors while keeping the platform simple, secure and transparent.
        </p>
      </motion.div>

      <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="neu-flat-base p-8 flex flex-col items-center text-center transition-shadow hover:shadow-lg"
            >
              <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-inner ${feature.accent}`}>
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-[var(--secondary)]">
                {feature.title}
              </h3>
              <p className="mt-3 leading-relaxed text-[var(--secondary)]/70 font-medium text-sm">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}