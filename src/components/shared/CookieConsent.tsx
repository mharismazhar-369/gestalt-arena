"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Shield, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gestalt_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gestalt_cookie_consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("gestalt_cookie_consent", "declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-6 left-6 z-50 max-w-md"
        >
          <div className="trionn-glass-card rounded-2xl border border-white/15 p-5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/30 text-cyan-400">
                <Cookie size={20} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Privacy & Preferences
                  </h4>
                  <button
                    onClick={handleDecline}
                    className="text-slate-400 hover:text-white transition p-1"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                  We use essential session tokens and analytics cookies to optimize your window-shopping marketplace experience. Read our{" "}
                  <Link href="/privacy" className="text-cyan-400 underline hover:text-cyan-300 transition">
                    Privacy Policy
                  </Link>.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={handleAccept}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-xs font-bold text-black transition hover:scale-102 hover:brightness-110 shadow-lg shadow-cyan-500/20"
                  >
                    <Check size={14} /> Accept All
                  </button>
                  <button
                    onClick={handleDecline}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Necessary Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
