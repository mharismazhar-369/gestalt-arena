"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "100%",
    title: "Free Browsing",
    description: "Anyone can explore investors and startups before registering.",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    value: "256-bit",
    title: "Encrypted Chat",
    description: "Private conversations protected with end-to-end encryption architecture.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    value: "190+",
    title: "Countries",
    description: "Designed for entrepreneurs and investors across the globe.",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    value: "24 hrs",
    title: "Subscription Review",
    description: "Manual payment verification keeps fraud and chargebacks low.",
    gradient: "from-rose-400 to-red-500",
  },
];

export default function StatsSection() {
  return (
    <section id="stats" className="relative z-10 mx-auto max-w-7xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Platform at a Glance
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600 font-medium leading-relaxed">
          Built to connect opportunities—not process investments. Browse freely, connect securely, and negotiate independently.
        </p>
      </motion.div>

      <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl border border-white/80 bg-white/70 p-8 text-center backdrop-blur-xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] transition-all"
          >
            <div className={`mx-auto flex h-20 w-full items-center justify-center text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br ${item.gradient}`}>
              {item.value}
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {item.title}
            </h3>
            <p className="mt-3 leading-relaxed text-slate-600 text-xs font-medium">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}