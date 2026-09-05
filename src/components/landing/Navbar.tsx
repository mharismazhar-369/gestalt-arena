"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import BetaBadge from "@/components/shared/BetaBadge";
import { useAuth } from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { Menu, X, Compass, Rocket, BookOpen, Tag, User, MessageSquare } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { session, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => setIsMounted(true), []);

  // Determine if we should render the Landing Page Glass theme or the App Neumorphic theme
  const isGlassTheme = pathname === "/" || pathname === "/about" || pathname === "/pricing";

  const navLinks = [
    { href: "/browse/investors", label: "Investors", icon: Compass },
    { href: "/browse/startups", label: "Startups", icon: Rocket },
    { href: "/browse/bids", label: "Active Bids", icon: Tag },
    { href: "/research", label: "Research", icon: BookOpen },
    { href: "/pricing", label: "Pricing", icon: Tag },
    { href: "/feed", label: "Arena Feed", icon: MessageSquare },
  ];

  const userDisplayName = session?.user?.email?.split("@")[0] || "My Profile";
  const homeRoute = session?.user ? "/dashboard" : "/";

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-6"
    >
      <div
        className={
          isGlassTheme
            ? "mx-auto flex max-w-7xl items-center justify-between px-6 py-4 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]"
            : "neu-flat-base mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        }
      >
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link
            href={homeRoute}
            className={`text-xl font-black tracking-widest uppercase ${isGlassTheme ? "text-slate-900" : "text-[var(--secondary)]"}`}
          >
            Gestalt<span className={isGlassTheme ? "text-emerald-500" : "text-[var(--accent)]"}>Arena</span>
          </Link>
          <BetaBadge variant="pill" className="hidden sm:inline-flex opacity-70" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isGlassTheme
                    ? "text-slate-600 hover:text-indigo-600"
                    : "text-[var(--secondary)] hover:text-[var(--accent)]"
                  }`}
              >
                <Icon size={14} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {isMounted && (
            !loading && session ? (
              <div className="flex items-center gap-4">
                <NotificationDropdown />
                <Link
                  href="/dashboard"
                  className={
                    isGlassTheme
                      ? "flex items-center gap-2 px-5 py-2 rounded-full border border-slate-200 bg-white/50 text-xs font-bold text-slate-700 hover:bg-white hover:border-slate-300 transition-all"
                      : "neu-pressed-base flex items-center gap-2 px-5 py-2 text-xs font-bold text-[var(--secondary)]"
                  }
                >
                  <User size={14} className={isGlassTheme ? "text-indigo-600" : "text-[var(--accent)]"} />
                  <span>{userDisplayName}</span>
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={
                    isGlassTheme
                      ? "px-5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                      : "neu-btn px-5 py-2 text-xs"
                  }
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={
                    isGlassTheme
                      ? "px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-colors shadow-sm"
                      : "neu-pressed-base px-5 py-2 text-xs font-bold text-[var(--secondary)]"
                  }
                >
                  Join Platform
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          {isMounted && !loading && session && <NotificationDropdown />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={
              isGlassTheme
                ? "p-2 text-slate-600 hover:text-indigo-600"
                : "neu-pressed-base p-2 text-[var(--secondary)] hover:text-[var(--accent)]"
            }
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </motion.header>
  );
}