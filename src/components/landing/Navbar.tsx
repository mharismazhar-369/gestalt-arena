"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BetaBadge from "@/components/shared/BetaBadge";
import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { Menu, X, Compass, Rocket, BookOpen, Tag, User, MessageSquare } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session, loading } = useAuth();

  const navLinks = [
    { href: "/browse/investors", label: "Investors", icon: Compass },
    { href: "/browse/startups", label: "Startups", icon: Rocket },
    { href: "/research", label: "Research", icon: BookOpen },
    { href: "/pricing", label: "Pricing", icon: Tag },
    { href: "/feed", label: "Arena Feed", icon: MessageSquare },
  ];

  const userEmail = session?.user?.email;
  const userDisplayName = userEmail ? userEmail.split("@")[0] : "My Profile";

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6"
    >
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-slate-950/70 px-6 py-3.5 backdrop-blur-2xl shadow-2xl shadow-cyan-950/20">

        {/* Brand & Beta Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-white hover:opacity-90 transition flex items-center gap-1.5"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Gestalt
            </span>
            <span className="text-white">ARENA</span>
          </Link>
          <BetaBadge variant="pill" className="hidden sm:inline-flex" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-cyan-400 transition"
              >
                <Icon size={15} className="text-slate-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Action Buttons (Logged In vs Logged Out) */}
        <div className="hidden items-center gap-3 md:flex">
          {!loading && session ? (
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div className="h-6 w-px bg-white/10 mx-1"></div>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300 hover:border-cyan-400 transition"
              >
                <User size={14} className="text-cyan-400" />
                <span>{userDisplayName}</span>
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-5 py-2 text-xs font-bold text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-400 hover:text-black shadow-lg shadow-cyan-500/10"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2 text-xs font-bold text-black transition hover:scale-105 shadow-lg shadow-violet-500/20"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle & Notifications */}
        <div className="flex items-center gap-2 md:hidden">
          {!loading && session && <NotificationDropdown />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 rounded-2xl border border-white/10 bg-slate-950/95 p-6 backdrop-blur-2xl md:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-slate-400">Navigation</span>
                <BetaBadge variant="pill" />
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-base font-semibold text-slate-200 hover:text-cyan-400"
                  >
                    <Icon size={18} className="text-cyan-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="mt-2 border-t border-white/10 pt-4 flex flex-col gap-3">
                {!loading && session ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 py-2.5 text-sm font-bold text-cyan-300"
                    >
                      <User size={16} /> {userDisplayName}
                    </Link>
                    <div onClick={() => setMobileMenuOpen(false)}>
                      <LogoutButton />
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 py-2.5 text-sm font-bold text-cyan-300"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 py-2.5 text-sm font-bold text-black"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}