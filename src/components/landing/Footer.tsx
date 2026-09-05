"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BetaBadge from "@/components/shared/BetaBadge";
import { ShieldCheck, Globe } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Determine if we should render the Landing Page Glass theme or the App Neumorphic theme
  const isGlassTheme = pathname === "/" || pathname === "/about" || pathname === "/pricing";

  return (
    <footer
      className={`relative z-10 mt-12 ${isGlassTheme
        ? "border-t border-slate-200 bg-white/80 backdrop-blur-2xl"
        : "border-t border-[var(--secondary)]/10 bg-[var(--primary)]"
        }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">

          <div className="md:col-span-1 space-y-4">
            <Link
              href="/"
              className={`text-2xl font-black tracking-tight flex items-center gap-2 ${isGlassTheme ? "text-slate-900" : "text-[var(--secondary)]"
                }`}
            >
              <span className={isGlassTheme ? "bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent" : "text-[var(--secondary)]"}>
                Gestalt
              </span>
              <span className={!isGlassTheme ? "text-[var(--accent)]" : ""}>ARENA</span>
            </Link>
            <p className={`text-xs font-medium leading-relaxed ${isGlassTheme ? "text-slate-500" : "text-[var(--secondary)]/70"
              }`}>
              The premier window-shopping matchmaking marketplace connecting strategic investors, founders, and groundbreaking startups globally.
            </p>
            <div className="pt-1">
              <BetaBadge variant="pill" />
            </div>
          </div>

          <div>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${isGlassTheme ? "text-slate-900" : "text-[var(--secondary)]"
              }`}>Marketplace</h4>
            <ul className={`space-y-2.5 text-xs font-medium ${isGlassTheme ? "text-slate-500" : "text-[var(--secondary)]/70"
              }`}>
              <li><Link href="/browse/investors" className={`transition ${isGlassTheme ? "hover:text-indigo-600" : "hover:text-[var(--accent)]"}`}>Browse Investors</Link></li>
              <li><Link href="/browse/startups" className={`transition ${isGlassTheme ? "hover:text-indigo-600" : "hover:text-[var(--accent)]"}`}>Browse Startups</Link></li>
              <li><Link href="/research" className={`transition ${isGlassTheme ? "hover:text-indigo-600" : "hover:text-[var(--accent)]"}`}>Research & Insights</Link></li>
              <li><Link href="/pricing" className={`transition ${isGlassTheme ? "hover:text-indigo-600" : "hover:text-[var(--accent)]"}`}>Tier Membership</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${isGlassTheme ? "text-slate-900" : "text-[var(--secondary)]"
              }`}>Company</h4>
            <ul className={`space-y-2.5 text-xs font-medium ${isGlassTheme ? "text-slate-500" : "text-[var(--secondary)]/70"
              }`}>
              <li><Link href="/about" className={`transition ${isGlassTheme ? "hover:text-indigo-600" : "hover:text-[var(--accent)]"}`}>About Us</Link></li>
              <li><Link href="/login" className={`transition ${isGlassTheme ? "hover:text-indigo-600" : "hover:text-[var(--accent)]"}`}>Account Login</Link></li>
              <li><Link href="/register" className={`transition ${isGlassTheme ? "hover:text-indigo-600" : "hover:text-[var(--accent)]"}`}>Join Platform</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${isGlassTheme ? "text-slate-900" : "text-[var(--secondary)]"
              }`}>Legal & Compliance</h4>
            <ul className={`space-y-2.5 text-xs font-medium ${isGlassTheme ? "text-slate-500" : "text-[var(--secondary)]/70"
              }`}>
              <li><Link href="/privacy" className={`transition ${isGlassTheme ? "hover:text-indigo-600" : "hover:text-[var(--accent)]"}`}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={`transition ${isGlassTheme ? "hover:text-indigo-600" : "hover:text-[var(--accent)]"}`}>Terms & Conditions</Link></li>
              <li><Link href="/disclaimer" className={`transition ${isGlassTheme ? "hover:text-indigo-600" : "hover:text-[var(--accent)]"}`}>Regulatory Disclaimers</Link></li>
            </ul>
          </div>
        </div>

        <div className={`mt-12 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row text-xs font-medium ${isGlassTheme ? "border-t border-slate-200 text-slate-500" : "border-t border-[var(--secondary)]/10 text-[var(--secondary)]/60"
          }`}>
          <p>© 2026 Gestalt Technologies (Private) Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className={`flex items-center gap-1.5 ${isGlassTheme ? "text-slate-600" : "text-[var(--secondary)]/70"}`}>
              <Globe size={14} className={isGlassTheme ? "text-indigo-500" : "text-[var(--accent)]"} /> Global Platform
            </span>
            <span className={`flex items-center gap-1.5 ${isGlassTheme ? "text-slate-600" : "text-[var(--secondary)]/70"}`}>
              <ShieldCheck size={14} className={isGlassTheme ? "text-emerald-500" : "text-[var(--accent)]"} /> Encrypted Protocol
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}