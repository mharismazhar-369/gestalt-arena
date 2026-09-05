"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Globe2,
  Handshake,
  BadgeDollarSign,
  BellRing,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: Handshake,
    title: "Smart Matchmaking",
    description: "Discover founders, startups and investors through an intelligent marketplace.",
    accent: "text-[#8BC53D]", // Apple Green
  },
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    description: "Investor nicknames with startup business information for greater trust.",
    accent: "text-[#D6BD98]", // Almond
  },
  {
    icon: Lock,
    title: "Private Messaging",
    description: "Secure conversations with spam protection and daily interaction limits.",
    accent: "text-[#8BC53D]",
  },
  {
    icon: BadgeDollarSign,
    title: "Investment Types",
    description: "Seed, Angel, VC, Private Equity, Revenue Share, Grants and Debt.",
    accent: "text-[#D6BD98]",
  },
  {
    icon: BellRing,
    title: "Notifications",
    description: "Receive real-time updates for negotiations, messages and opportunities.",
    accent: "text-[#8BC53D]",
  },
  {
    icon: Globe2,
    title: "Global Platform",
    description: "Connect founders and investors from countries around the world.",
    accent: "text-[#D6BD98]",
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-center text-4xl md:text-5xl font-black text-[#E2F0CC]">
          Platform Features
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-center text-lg text-[#E2F0CC]/70 font-medium">
          Built to safely connect entrepreneurs, founders and investors while keeping the platform simple, secure and transparent.
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
              className="neu-flat-base p-8 transition-transform"
            >
              <div className="neu-pressed-base mb-6 flex h-16 w-16 items-center justify-center">
                <Icon className={feature.accent} size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-main-inv)]">
                {feature.title}
              </h3>
              <p className="mt-4 leading-relaxed text-[var(--text-main-inv)]/70 font-medium">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}