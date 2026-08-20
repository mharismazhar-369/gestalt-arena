"use client";

import { motion } from "framer-motion";

export default function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden">

      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-fuchsia-500/20 blur-[150px]"
      />

      <motion.div
        animate={{
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff15,transparent_70%)]"
      />

    </div>
  );
}