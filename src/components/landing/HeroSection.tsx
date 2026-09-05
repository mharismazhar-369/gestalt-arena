"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BriefcaseBusiness, Rocket } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center pt-20">

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="neu-flat-base p-12 md:p-20 max-w-5xl"
      >
        <h1 className="text-5xl md:text-7xl font-black leading-tight text-[#E2F0CC]">
          Where
          <span className="text-[#8BC53D]"> Capital </span>
          Meets
          <span className="text-[#D6BD98]"> Execution</span>
        </h1>

        <p className="mt-8 mx-auto max-w-2xl text-lg text-[#E2F0CC]/70 font-medium">
          The infrastructure for private market execution. Discover strategic capital mandates and highly vetted startup pitches in one unified, transparent ledger.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">

          <div className="theme-investor w-full sm:w-auto">
            <Link
              href="/investor"
              className="neu-investor-btn flex w-full items-center justify-center gap-3 px-10 py-5 text-lg"
            >
              <BriefcaseBusiness size={24} />
              Deploy Capital
            </Link>
          </div>

          <div className="theme-startup w-full sm:w-auto">
            <Link
              href="/startup"
              className="neu-startup-btn flex w-full items-center justify-center gap-3 px-10 py-5 text-lg"
            >
              <Rocket size={24} />
              Raise Funds
            </Link>
          </div>

        </div>
      </motion.div>

    </section>
  );
}