"use client";

import { motion } from "framer-motion";
import { FileText, Globe2, Handshake, BadgeDollarSign, Store, Layers } from "lucide-react";
import Background from "./Background";

const features = [
  {
    icon: Handshake,
    title: "Smart Discovery",
    description: "Discover founders, startups and investors through an intelligent marketplace.",
    accent: "text-emerald-500 bg-emerald-50 border-emerald-100",
  },

  {
    icon: FileText,
    title: "Mandates & Pitch Decks",
    description: "Explore investor mandates and founder pitch decks to discover aligned opportunities.",
    accent: "text-indigo-500 bg-indigo-50 border-indigo-100",
  },

  {
    icon: Store,
    title: "Emporium",
    description: "Showcase and discover startups, companies, products and services in one marketplace.",
    accent: "text-rose-500 bg-rose-50 border-rose-100",
  },

  {
    icon: BadgeDollarSign,
    title: "Investor Types",
    description: "Connect with Angels, Solo Investors, VCs, Family Offices, Private Equity and Strategic Investors.",
    accent: "text-amber-500 bg-amber-50 border-amber-100",
  },

  {
    icon: Layers,
    title: "Startup Types",
    description: "Discover businesses across startups, SMEs, manufacturers, service providers, innovators and emerging ventures.",
    accent: "text-purple-500 bg-purple-50 border-purple-100",
  },

  {
    icon: Globe2,
    title: "Industries & Innovation",
    description: "Explore opportunities across IT, engineering, medical sciences, robotics, manufacturing, energy, agriculture and more.",
    accent: "text-sky-500 bg-sky-50 border-sky-100",
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
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Arena Features
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600 font-medium leading-relaxed">
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
              className="rounded-3xl border border-white/80 bg-white/70 p-8 backdrop-blur-xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border ${feature.accent}`}>
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600 font-medium text-sm">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}