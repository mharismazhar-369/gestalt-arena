"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "100%",
    title: "Free Browsing",
    description: "Anyone can explore investors and startups before registering.",
    accent: "text-[#8BC53D]", // Apple Green
  },
  {
    value: "256-bit",
    title: "Encrypted Chat",
    description: "Private conversations protected with end-to-end encryption architecture.",
    accent: "text-[#D6BD98]", // Almond
  },
  {
    value: "190+",
    title: "Countries",
    description: "Designed for entrepreneurs and investors across the globe.",
    accent: "text-[#8BC53D]",
  },
  {
    value: "24 hrs",
    title: "Subscription Review",
    description: "Manual payment verification keeps fraud and chargebacks low.",
    accent: "text-[#D6BD98]",
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
      >
        <h2 className="text-center text-4xl md:text-5xl font-black text-[#E2F0CC]">
          Platform at a Glance
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-center text-lg text-[#E2F0CC]/70 font-medium">
          Built to connect opportunities—not process investments. Browse freely, connect securely, and negotiate independently.
        </p>
      </motion.div>

      <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            whileHover={{ y: -6 }}
            className="neu-flat-base p-8 text-center transition-transform"
          >
            <div className={`neu-pressed-base mx-auto flex h-24 w-full items-center justify-center text-4xl font-black ${item.accent}`}>
              {item.value}
            </div>
            <h3 className="mt-6 text-xl font-bold text-[#E2F0CC]">
              {item.title}
            </h3>
            <p className="mt-3 leading-relaxed text-[#E2F0CC]/60 text-sm font-medium">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}