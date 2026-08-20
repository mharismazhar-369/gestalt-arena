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
    description:
      "Discover founders, startups and investors through an intelligent marketplace.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    description:
      "Investor nicknames with startup business information for greater trust.",
  },
  {
    icon: Lock,
    title: "Private Messaging",
    description:
      "Secure conversations with spam protection and daily interaction limits.",
  },
  {
    icon: BadgeDollarSign,
    title: "Investment Types",
    description:
      "Seed, Angel, VC, Private Equity, Revenue Share, Grants and Debt.",
  },
  {
    icon: BellRing,
    title: "Notifications",
    description:
      "Receive real-time updates for negotiations, messages and opportunities.",
  },
  {
    icon: Globe2,
    title: "Global Platform",
    description:
      "Connect founders and investors from countries around the world.",
  },
];

export default function FeatureCards() {
  return (
    <section
      id="features"
      className="relative z-10 mx-auto max-w-7xl px-6 py-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-center text-5xl font-black text-white">
          Platform Features
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-center text-lg text-zinc-400">
          Built to safely connect entrepreneurs, founders and investors while
          keeping the platform simple, secure and transparent.
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
              transition={{
                delay: index * 0.08,
                duration: 0.5,
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15">
                <Icon className="text-cyan-400" size={30} />
              </div>

              <h3 className="text-2xl font-bold text-white">
                {feature.title}
              </h3>

              <p className="mt-5 leading-8 text-zinc-400">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}