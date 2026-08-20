"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import { useUserTier, TierType } from "@/components/context/UserTierContext";
import { Check, ShieldCheck, Crown, Sparkles, Zap, Lock, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  const { tier, setTier } = useUserTier();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const plans: {
    id: TierType;
    name: string;
    badge: string;
    tagline: string;
    monthlyPrice: string;
    annualPrice: string;
    borderColor: string;
    glowClass: string;
    popular?: boolean;
    features: string[];
    limits: {
      posts24h: string;
      charLimit: string;
      articles: string;
      investmentCap: string;
    };
  }[] = [
    {
      id: "freemium",
      name: "Freemium",
      badge: "Free Member",
      tagline: "Essential window-shopping access for exploratory discovery",
      monthlyPrice: "$0",
      annualPrice: "$0",
      borderColor: "border-cyan-500/30",
      glowClass: "trionn-glow-cyan",
      features: [
        "Browse Investor & Startup directories freely",
        "View public pitch cards & investment tags",
        "Public Arena social feed reading",
        "Standard support access",
      ],
      limits: {
        posts24h: "20 posts / 24 hours",
        charLimit: "500 characters max",
        articles: "Locked (0 articles/day)",
        investmentCap: "N/A (Read-only)",
      },
    },
    {
      id: "gold",
      name: "Gold Tier",
      badge: "Most Popular",
      tagline: "Active matchmaking & direct interaction for serious founders and investors",
      monthlyPrice: "$49",
      annualPrice: "$39",
      borderColor: "border-amber-500/50",
      glowClass: "trionn-glow-gold",
      popular: true,
      features: [
        "All Freemium features included",
        "Direct Role-Based Interactivity (Connect & Message)",
        "Write & Publish up to 5 Research Articles / day",
        "Transact & allocation rights up to $50,000",
        "Gold Partner badge verification",
      ],
      limits: {
        posts24h: "50 posts / 24 hours",
        charLimit: "1,000 characters max",
        articles: "5 Research Articles / day",
        investmentCap: "Up to $50,000 cap",
      },
    },
    {
      id: "platinum",
      name: "Platinum Tier",
      badge: "Unlimited Elite",
      tagline: "Unconstrained maximum platform capabilities for top-tier VCs & growth founders",
      monthlyPrice: "$199",
      annualPrice: "$149",
      borderColor: "border-violet-500/60",
      glowClass: "trionn-glow-violet",
      features: [
        "Unrestricted/Maximum Platform Capabilities",
        "Unlimited Research & Article Publications",
        "Maximum Investment Thresholds & Unlimited Allocations",
        "Priority Directory Placement & Featured Pitch Cards",
        "Dedicated Deal Syndication Concierge",
      ],
      limits: {
        posts24h: "Unlimited Posts (9,999/24h)",
        charLimit: "5,000 characters max",
        articles: "Unlimited Articles / day",
        investmentCap: "Unlimited Thresholds",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-7xl w-full relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex justify-center">
            <BetaBadge variant="pill" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Transparent Pricing &
            <span className="block bg-gradient-to-r from-cyan-400 via-amber-400 to-violet-400 bg-clip-text text-transparent">
              Platform Tier Capabilities
            </span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            Choose the membership tier aligned with your capital deployment or fundraising targets.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="trionn-glass rounded-full border border-white/10 p-1 flex items-center gap-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                  billingCycle === "monthly"
                    ? "bg-white text-black shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-gradient-to-r from-cyan-400 to-violet-500 text-black shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] text-white">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentTier = tier === plan.id;
            const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -8 }}
                className={`trionn-glass-card rounded-3xl border ${plan.borderColor} p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl ${
                  plan.popular ? "bg-amber-500/[0.04]" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase text-black tracking-widest shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Title & Badge */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
                      {plan.badge}
                    </span>
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-10">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="border-y border-white/10 py-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{price}</span>
                    <span className="text-xs text-slate-400">/ month {billingCycle === "annual" && price !== "$0" ? "(billed annually)" : ""}</span>
                  </div>

                  {/* Explicit Tier Limits Box */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2 text-xs">
                    <div className="font-bold text-white uppercase tracking-wider text-[10px] text-cyan-400">
                      State Enforcement Limits
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>24h Post Cap:</span>
                      <strong className="text-white">{plan.limits.posts24h}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Character Limit:</span>
                      <strong className="text-white">{plan.limits.charLimit}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Articles / Day:</span>
                      <strong className="text-white">{plan.limits.articles}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Investment Threshold:</span>
                      <strong className="text-white">{plan.limits.investmentCap}</strong>
                    </div>
                  </div>

                  {/* Included Features List */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Tier Capabilities
                    </span>
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check size={14} className="shrink-0 text-cyan-400 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select / Active Tier Action Button */}
                <div className="mt-8 pt-4">
                  <button
                    onClick={() => setTier(plan.id)}
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold transition shadow-lg ${
                      isCurrentTier
                        ? "bg-emerald-400 text-black shadow-emerald-500/20 cursor-default"
                        : plan.id === "platinum"
                        ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:scale-102"
                        : plan.id === "gold"
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:scale-102"
                        : "bg-white/10 text-white border border-white/15 hover:bg-white/20"
                    }`}
                  >
                    {isCurrentTier ? "✓ Active Tier Selected" : `Select ${plan.name}`}
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold text-white">Full Feature Comparison Matrix</h3>
            <p className="text-xs text-slate-400">Detailed breakdown of platform capabilities across user tiers</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Feature / Limit</th>
                  <th className="py-3 px-4 text-cyan-400">Freemium</th>
                  <th className="py-3 px-4 text-amber-400">Gold Tier</th>
                  <th className="py-3 px-4 text-violet-400">Platinum Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Directory Window-Shopping</td>
                  <td className="py-3 px-4">Unlimited Browsing</td>
                  <td className="py-3 px-4">Unlimited Browsing</td>
                  <td className="py-3 px-4">Unlimited Browsing</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Post Character Limit</td>
                  <td className="py-3 px-4 font-mono text-cyan-300">500 Chars</td>
                  <td className="py-3 px-4 font-mono text-amber-300">1,000 Chars</td>
                  <td className="py-3 px-4 font-mono text-violet-300">5,000 Chars (Max)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Daily Post Limit (24h)</td>
                  <td className="py-3 px-4 font-mono">20 Posts / 24h</td>
                  <td className="py-3 px-4 font-mono">50 Posts / 24h</td>
                  <td className="py-3 px-4 font-mono font-bold text-violet-300">Unlimited (9,999)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Research & Article Publishing</td>
                  <td className="py-3 px-4 text-rose-400 font-semibold">Locked (0)</td>
                  <td className="py-3 px-4 font-mono">Up to 5 / day</td>
                  <td className="py-3 px-4 font-mono font-bold text-violet-300">Unlimited / day</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Investment Threshold Cap</td>
                  <td className="py-3 px-4 text-slate-500">Read-Only</td>
                  <td className="py-3 px-4 font-mono">Up to $50,000</td>
                  <td className="py-3 px-4 font-mono font-bold text-violet-300">Unlimited Thresholds</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Direct Investor Interactivity</td>
                  <td className="py-3 px-4 text-slate-500">View Only</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold font-mono">Role-Based Connect</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold font-mono">Unlimited Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
