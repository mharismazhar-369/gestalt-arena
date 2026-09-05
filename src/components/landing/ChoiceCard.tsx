"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
  description: string;
  href: string;
}

export default function ChoiceCard({ title, description, href }: Props) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className="group flex h-64 w-80 flex-col justify-between rounded-3xl border border-white/80 bg-white/70 p-8 backdrop-blur-2xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.15)] hover:bg-white/90"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-900">{title}</h2>
          <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm transition-all duration-300 group-hover:translate-x-2">
          Explore <ChevronRight size={16} />
        </div>
      </Link>
    </motion.div>
  );
}