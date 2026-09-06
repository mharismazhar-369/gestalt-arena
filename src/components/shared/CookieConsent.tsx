"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Check, X, Settings2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CONSENT_KEY = "gestalt_cookie_consent_v2"; // Versioned key forces re-consent across all users

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Clean up legacy v1 key to ensure force re-consent
    localStorage.removeItem("gestalt_cookie_consent");

    // Check for v2 consent
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // 30-Minute Inactivity Session Timeout
  const handleIdleTimeout = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.signOut();
      window.location.href = "/login?reason=timeout";
    }
  }, []);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(handleIdleTimeout, IDLE_TIMEOUT);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetIdleTimer, { passive: true }));

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => document.removeEventListener(event, resetIdleTimer));
    };
  }, [handleIdleTimeout]);

  // Dual-Persistence Consent Handler (LocalStorage + Visitor Metrics + Supabase Profile Sync)
  const saveConsent = async (choice: "all" | "necessary") => {
    // 1. Save to browser storage immediately
    localStorage.setItem(CONSENT_KEY, choice);

    try {
      // 2. Push/Increment site visitor entry in DB
      // Anonymizes user agent if 'Strict' is selected for GDPR/CCPA compliance
      await supabase.from("site_visits").insert([
        {
          user_agent: choice === "all" ? navigator.userAgent : "Anonymized (Strict)",
          consent_level: choice,
        },
      ]);

      // 3. Sync consent record to Supabase profiles table for authenticated users
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from("profiles")
          .update({
            cookie_consent_choice: choice,
            cookie_consent_at: new Date().toISOString(),
          })
          .eq("id", session.user.id);
      }
    } catch (error) {
      console.error("Failed to log visitor metric or consent to database:", error);
    }

    setShowBanner(false);
  };

  const handleAcceptAll = () => saveConsent("all");
  const handleNecessaryOnly = () => saveConsent("necessary");

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[450px] z-[100]"
        >
          <div className="neu-flat-base rounded-3xl p-6 shadow-2xl border border-blue-500/20 bg-[var(--primary)]/95 backdrop-blur-xl flex flex-col space-y-4">

            <div className="flex items-start justify-between border-b border-[var(--secondary)]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl neu-pressed-base text-blue-500">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--secondary)] tracking-wide">
                    Data Processing & Cookies
                  </h4>
                  <p className="text-[10px] font-bold text-[var(--secondary)]/50 uppercase tracking-widest">
                    GDPR & CCPA Compliant
                  </p>
                </div>
              </div>
              <button onClick={handleNecessaryOnly} className="p-2 text-[var(--secondary)]/40 hover:text-rose-500 transition-colors">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[var(--secondary)]/70 font-medium leading-relaxed">
              Gestalt Arena processes telemetry and session data to secure deal rooms, authenticate identities, and authorize tier-based actions. Review our <Link href="/privacy" className="text-blue-500 font-bold hover:underline">Privacy Policy</Link> for detailed data handling procedures.
            </p>

            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="space-y-3 bg-blue-600/5 p-4 rounded-2xl border border-blue-500/20 text-[10px] text-[var(--secondary)]/80 font-medium"
              >
                <div className="space-y-1">
                  <strong className="text-blue-500 flex items-center gap-1.5"><Cookie size={12} /> Essential (Required)</strong>
                  <p>Supabase Auth tokens, CSRF protection, and connection states. Cannot be disabled.</p>
                </div>
                <div className="space-y-1">
                  <strong className="text-[var(--accent)] flex items-center gap-1.5"><Settings2 size={12} /> Performance & Telemetry</strong>
                  <p>Aggregated visitor counts and rate-limiting data. Bound to anonymized IP hashes.</p>
                </div>
                <div className="space-y-1">
                  <strong className="text-rose-500 flex items-center gap-1.5"><AlertTriangle size={12} /> Session Timeout Enforced</strong>
                  <p>Idle connections are forcefully severed after 30 minutes to protect deal room integrity.</p>
                </div>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full sm:w-auto px-4 py-3 text-[10px] font-bold text-[var(--secondary)]/60 hover:text-[var(--secondary)] transition"
              >
                {showDetails ? "Hide Specifications" : "View Specifications"}
              </button>

              <div className="flex w-full sm:w-auto gap-2 ml-auto">
                <button
                  onClick={handleNecessaryOnly}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-transparent border border-[var(--secondary)]/20 text-[var(--secondary)] hover:bg-[var(--secondary)]/5 text-xs font-bold transition"
                >
                  Strict
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-[2] sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 text-xs font-bold shadow-lg transition"
                >
                  <Check size={14} /> Accept All
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}