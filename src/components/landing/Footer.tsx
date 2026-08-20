"use client";

import Link from "next/link";
import BetaBadge from "@/components/shared/BetaBadge";
import { ShieldCheck, Sparkles, Globe, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          
          {/* Brand Info & Beta Badge */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Gestalt
              </span>
              <span>ARENA</span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              The premier TRIONN-styled window-shopping matchmaking marketplace connecting strategic investors, founders, and groundbreaking startups globally.
            </p>

            <div className="pt-1">
              <BetaBadge variant="pill" />
            </div>
          </div>

          {/* Directory Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/browse/investors" className="hover:text-cyan-400 transition">
                  Browse Investors
                </Link>
              </li>
              <li>
                <Link href="/browse/startups" className="hover:text-cyan-400 transition">
                  Browse Startups
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-cyan-400 transition">
                  Research & Insights
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-cyan-400 transition">
                  Tier Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/about" className="hover:text-cyan-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-cyan-400 transition">
                  Account Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-cyan-400 transition">
                  Join Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/privacy" className="hover:text-cyan-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-cyan-400 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-cyan-400 transition">
                  Regulatory Disclaimers
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-slate-400">
          <p>© 2026 Gestalt Technologies (Private) Ltd. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Globe size={14} className="text-cyan-400" /> Global Platform
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck size={14} className="text-emerald-400" /> Encrypted Protocol
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}