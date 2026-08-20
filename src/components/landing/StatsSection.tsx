"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "100%",
    title: "Free Browsing",
    description: "Anyone can explore investors and startups before registering.",
  },
  {
    value: "256-bit",
    title: "Encrypted Chat",
    description: "Private conversations protected with end-to-end encryption architecture.",
  },
  {
    value: "190+",
    title: "Countries",
    description: "Designed for entrepreneurs and investors across the globe.",
  },
  {
    value: "24 hrs",
    title: "Subscription Review",
    description: "Manual payment verification keeps fraud and chargebacks low.",
  },
];

export default function StatsSection() {
  return (
    <section
      id="stats"
      className="relative z-10 mx-auto max-w-7xl px-6 py-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-center text-5xl font-black text-white">
          Platform at a Glance
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-center text-lg text-zinc-400">
          Built to connect opportunities—not process investments. Browse freely,
          connect securely, and negotiate independently.
        </p>
      </motion.div>

      <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.08,
              duration: 0.5,
            }}
            whileHover={{
              y: -6,
              scale: 1.03,
            }}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
          >
            <div className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-5xl font-black text-transparent">
              {item.value}
            </div>

            <h3 className="mt-5 text-2xl font-bold text-white">
              {item.title}
            </h3>

            <p className="mt-4 leading-7 text-zinc-400">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}