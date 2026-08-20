"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  title: string;
  description: string;
  href: string;
}

export default function ChoiceCard({
  title,
  description,
  href,
}: Props) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      whileTap={{
        scale: 0.98,
      }}
    >
      <Link
        href={href}
        className="group flex h-64 w-80 flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/10"
      >
        <div>

          <h2 className="text-3xl font-bold text-white">

            {title}

          </h2>

          <p className="mt-4 text-sm leading-7 text-zinc-300">

            {description}

          </p>

        </div>

        <div className="text-cyan-400 transition-all duration-300 group-hover:translate-x-3">

          →

        </div>

      </Link>
    </motion.div>
  );
}