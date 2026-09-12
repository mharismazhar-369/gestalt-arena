"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import { useUserTier } from "@/components/context/UserTierContext";
import { Check, ShieldCheck, Crown, Sparkles, Building2, Briefcase, Store } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  const { tier } = useUserTier();
  const [selectedRole, setSelectedRole] = useState<"startup" | "investor">("startup");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "biannual" | "annual">("annual");

  // Track authentication status to route non-registered users
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  // Dynamic Pricing Table based on Role & Cycle
  const pricingData = {
    startup: {
      gold: { monthly: "$19", biannual: "$99", annual: "$169", monthlyEquiv: "$14/mo" },
      platinum: { monthly: "$69", biannual: "$349", annual: "$599", monthlyEquiv: "$49/mo" },
    },
    investor: {
      gold: { monthly: "$38", biannual: "$198", annual: "$338", monthlyEquiv: "$28/mo" },
      platinum: { monthly: "$138", biannual: "$698", annual: "$1,198", monthlyEquiv: "$99/mo" },
    },
  };

  const activeRates = pricingData[selectedRole];

  const plans = [
    {
      id: "freemium",
      name: "Freemium",
      badge: "Discovery Pass",
      tagline: "Essential window-shopping access to discover deal flow.",
      price: "$0",
      periodLabel: "Free Forever",
      popular: false,
      features: [
        "Browse Investor & Startup directories",
        "View public pitch cards & tags",
        "Read-only Arena social feed",
        "Pay-as-you-go Emporium Market Ads",
      ],
      limits: {
        posts24h: "3 posts / 24 hours",
        charLimit: "500 characters max",
        articles: "1 Article / Month",
        investmentCap: "$0 (View Deals Only)",
        decks: "1 (Draft Mode Only)",
      },
    },
    {
      id: "gold",
      name: "Gold Tier",
      badge: selectedRole === "startup" ? "Founder Growth" : "Angel Partner",
      tagline: "Active matchmaking & direct interaction for serious players.",
      price: billingCycle === "annual" ? activeRates.gold.annual : billingCycle === "biannual" ? activeRates.gold.biannual : activeRates.gold.monthly,
      periodLabel: billingCycle === "annual" ? `billed annually (${activeRates.gold.monthlyEquiv})` : billingCycle === "biannual" ? "billed 6-monthly" : "billed monthly",
      popular: true,
      features: [
        "All Freemium features included",
        "Direct Role-Based Interactivity (Messaging)",
        "Publish to the Research Hub",
        "Verified Partner Badge",
        "+10% Discount on Emporium Ads",
      ],
      limits: {
        posts24h: "10 posts / 24 hours",
        charLimit: "1,000 characters max",
        articles: "4 Articles / Month",
        investmentCap: selectedRole === "startup" ? "Raise Cap: $500,000" : "Ticket Cap: $500,000",
        decks: "3 Active Public Decks",
      },
    },
    {
      id: "platinum",
      name: "Platinum Tier",
      badge: selectedRole === "startup" ? "Scaleup Elite" : "VC / Syndicate",
      tagline: "Unconstrained capabilities for top-tier VCs & growth founders.",
      price: billingCycle === "annual" ? activeRates.platinum.annual : billingCycle === "biannual" ? activeRates.platinum.biannual : activeRates.platinum.monthly,
      periodLabel: billingCycle === "annual" ? `billed annually (${activeRates.platinum.monthlyEquiv})` : billingCycle === "biannual" ? "billed 6-monthly" : "billed monthly",
      popular: false,
      features: [
        "Unrestricted Platform Capabilities",
        "Unlimited Priority Interactivity & InMail",
        "Featured Directory & Feed Placement",
        "Dedicated Deal Concierge Support",
        "+1 Free Standard Emporium Ad / Month",
      ],
      limits: {
        posts24h: "15 posts / 24 hours (Anti-Spam Protected)",
        charLimit: "1,500 characters max",
        articles: "10 Articles / Month",
        investmentCap: selectedRole === "startup" ? "Raise Cap: $5,000,000+" : "Ticket Cap: Unlimited",
        decks: "Unlimited Active Decks",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--primary)] text-[var(--secondary)] flex flex-col justify-between relative transition-colors duration-300">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-[1440px] w-full relative z-10 space-y-16">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex justify-center">
            <BetaBadge variant="pill" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-[var(--secondary)]">
            Transparent Pricing & <span className="text-[var(--accent)]">Platform Capabilities</span>
          </h1>

          <p className="text-[var(--secondary)]/70 text-sm leading-relaxed font-medium">
            Select your account role and deployment target. Prices exclude 3rd-party processing fees.
          </p>

          {/* Role Switcher */}
          <div className="pt-4 flex justify-center">
            <div className="neu-pressed-base p-1.5 flex items-center gap-2 rounded-2xl">
              <button
                onClick={() => setSelectedRole("startup")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${selectedRole === "startup"
                  ? "neu-flat-base text-[var(--accent)]"
                  : "text-[var(--secondary)]/50 hover:text-[var(--secondary)]"
                  }`}
              >
                <Building2 size={16} /> Startup / Founder (50% Off Baseline)
              </button>
              <button
                onClick={() => setSelectedRole("investor")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${selectedRole === "investor"
                  ? "neu-flat-base text-[var(--accent)]"
                  : "text-[var(--secondary)]/50 hover:text-[var(--secondary)]"
                  }`}
              >
                <Briefcase size={16} /> Investor / Syndicate (Standard Tier)
              </button>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="neu-pressed-base p-1.5 flex items-center gap-2 rounded-2xl">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${billingCycle === "monthly"
                  ? "neu-flat-base text-[var(--accent)]"
                  : "text-[var(--secondary)]/50 hover:text-[var(--secondary)]"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("biannual")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${billingCycle === "biannual"
                  ? "neu-flat-base text-[var(--accent)]"
                  : "text-[var(--secondary)]/50 hover:text-[var(--secondary)]"
                  }`}
              >
                6-Months
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${billingCycle === "annual"
                  ? "neu-flat-base text-[var(--accent)]"
                  : "text-[var(--secondary)]/50 hover:text-[var(--secondary)]"
                  }`}
              >
                <span>Annual</span>
                <span className="neu-pressed-base px-2 py-0.5 text-[9px] text-[var(--accent)] uppercase tracking-widest font-black">Save Up to 35%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentTier = tier === plan.id;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -8 }}
                className={`neu-flat-base p-8 flex flex-col justify-between relative overflow-hidden ${plan.popular ? "border-2 border-[var(--accent)]" : "border border-[var(--secondary)]/10"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[var(--accent)] px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase text-[var(--primary)] tracking-widest">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Title & Badge */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary)]/50 block mb-1">
                      {plan.badge}
                    </span>
                    <h3 className="text-2xl font-black text-[var(--secondary)] flex items-center gap-2">
                      {plan.id === "platinum" && <Crown size={20} className="text-[var(--accent)]" />}
                      {plan.id === "gold" && <Sparkles size={20} className="text-[var(--accent)]" />}
                      {plan.id === "freemium" && <ShieldCheck size={20} className="text-[var(--secondary)]/50" />}
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[var(--secondary)]/70 mt-2 leading-relaxed min-h-[40px] font-medium">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="border-y border-[var(--secondary)]/10 py-6 flex flex-col gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[var(--secondary)]">{plan.price}</span>
                      {plan.id !== "freemium" && <span className="text-xs font-bold text-[var(--secondary)]/50">/ period</span>}
                    </div>
                    <span className="text-[10px] font-mono text-[var(--secondary)]/50 uppercase tracking-wider">{plan.periodLabel}</span>
                  </div>

                  {/* Explicit Tier Limits Box */}
                  <div className="neu-pressed-base p-5 space-y-3 text-xs">
                    <div className="font-black text-[var(--accent)] uppercase tracking-wider text-[10px] mb-2">
                      Platform Enforced Limits
                    </div>
                    <div className="flex justify-between text-[var(--secondary)]/70 font-medium border-b border-[var(--secondary)]/5 pb-2">
                      <span>24h Post Cap:</span>
                      <strong className="text-[var(--secondary)]">{plan.limits.posts24h}</strong>
                    </div>
                    <div className="flex justify-between text-[var(--secondary)]/70 font-medium border-b border-[var(--secondary)]/5 pb-2">
                      <span>Research Cap:</span>
                      <strong className="text-[var(--secondary)]">{plan.limits.articles}</strong>
                    </div>
                    <div className="flex justify-between text-[var(--secondary)]/70 font-medium border-b border-[var(--secondary)]/5 pb-2">
                      <span>Active Decks:</span>
                      <strong className="text-[var(--secondary)]">{plan.limits.decks}</strong>
                    </div>
                    <div className="flex justify-between text-[var(--secondary)]/70 font-medium">
                      <span>Financial Threshold:</span>
                      <strong className="text-[var(--secondary)]">{plan.limits.investmentCap}</strong>
                    </div>
                  </div>

                  {/* Included Features List */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--secondary)]/50 block">
                      Tier Capabilities
                    </span>
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2 text-xs text-[var(--secondary)]/80 font-medium">
                        <Check size={14} className="shrink-0 text-[var(--accent)] mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscription Routing Placeholder Button with Auth Check */}
                <div className="mt-8 pt-6 border-t border-[var(--secondary)]/10">
                  <Link
                    href={
                      !isAuthenticated
                        ? "/register"
                        : isCurrentTier
                          ? "/dashboard"
                          : `/checkout/${plan.id}?role=${selectedRole}&cycle=${billingCycle}`
                    }
                    className={`w-full py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center border ${isAuthenticated && isCurrentTier
                        ? "bg-[var(--secondary)]/5 text-[var(--secondary)]/50 border-transparent cursor-default pointer-events-none"
                        : plan.popular
                          ? "bg-[var(--primary)] text-[var(--accent)] border-[var(--accent)] shadow-[5px_5px_10px_var(--shadow-dark),-5px_-5px_10px_var(--shadow-light)] hover:shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]"
                          : "neu-btn border-transparent"
                      }`}
                  >
                    {!isAuthenticated
                      ? `Register to Select ${plan.name}`
                      : isCurrentTier
                        ? "✓ Active Tier Selected"
                        : plan.id === "freemium"
                          ? "Start Free Window Shopping"
                          : `Subscribe to ${plan.name}`
                    }
                  </Link>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Emporium Advertisement Fixed Rate Card */}
        <div className="neu-flat-base p-8 space-y-6 max-w-6xl mx-auto relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--secondary)]/10 pb-4 gap-4">
            <div>
              <h3 className="text-xl font-black text-[var(--secondary)] flex items-center gap-2">
                <Store className="text-[var(--accent)]" size={20} /> Emporium Marketplace Ad Rates
              </h3>
              <p className="text-xs text-[var(--secondary)]/60 font-medium mt-1">Standardized non-subscription ad space for service providers and products.</p>
            </div>
            <Link href="/emporium" className="neu-btn px-5 py-2.5 text-xs shrink-0">
              Deploy Campaign →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="neu-pressed-base p-6 space-y-2 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-[var(--secondary)]/50 tracking-wider">Standard Discovery</span>
              <h4 className="text-xl font-black text-[var(--secondary)]">$15 <span className="text-xs font-medium text-[var(--secondary)]/60">/ 15 days</span></h4>
              <p className="text-xs text-[var(--secondary)]/70 font-medium">Standard directory ad placement across Emporium discovery feeds.</p>
              <p className="text-[10px] font-mono text-[var(--accent)] pt-2">$25 for 30 days extension</p>
            </div>

            <div className="neu-pressed-base p-6 space-y-2 rounded-2xl border border-[var(--accent)]/30">
              <span className="text-[10px] font-black uppercase text-[var(--accent)] tracking-wider">Category Spotlight</span>
              <h4 className="text-xl font-black text-[var(--secondary)]">$25 <span className="text-xs font-medium text-[var(--secondary)]/60">/ 15 days</span></h4>
              <p className="text-xs text-[var(--secondary)]/70 font-medium">Top-of-category pinned banner for targeted audience exposure.</p>
              <p className="text-[10px] font-mono text-[var(--accent)] pt-2">$45 for 30 days extension</p>
            </div>

            <div className="neu-pressed-base p-6 space-y-2 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-[var(--secondary)]/50 tracking-wider">Platinum Network Blast</span>
              <h4 className="text-xl font-black text-[var(--secondary)]">$50 <span className="text-xs font-medium text-[var(--secondary)]/60">/ 30 days</span></h4>
              <p className="text-xs text-[var(--secondary)]/70 font-medium">Global platform header banner visible across all user dashboards.</p>
              <p className="text-[10px] font-mono text-[var(--accent)] pt-2">Includes priority indexing</p>
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="neu-flat-base p-8 space-y-6 max-w-6xl mx-auto">
          <div className="border-b border-[var(--secondary)]/10 pb-4">
            <h3 className="text-xl font-black text-[var(--secondary)]">Full Feature Comparison Matrix</h3>
            <p className="text-xs text-[var(--secondary)]/60 font-medium mt-1">Detailed breakdown of platform capabilities across user tiers</p>
          </div>

          <div className="overflow-x-auto custom-scrollbar pb-4">
            <table className="w-full text-left text-xs text-[var(--secondary)]/80 font-medium whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-[var(--secondary)]/10 text-[var(--secondary)] font-black uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-4 bg-[var(--primary)] sticky left-0 z-10 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Feature / Limit</th>
                  <th className="py-4 px-4 text-[var(--secondary)]/60">Freemium</th>
                  <th className="py-4 px-4 text-[var(--accent)]">Gold Tier</th>
                  <th className="py-4 px-4 text-[var(--secondary)]">Platinum Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--secondary)]/10">
                <tr className="hover:bg-[var(--secondary)]/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--secondary)] bg-[var(--primary)] sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Post Character Limit</td>
                  <td className="py-3 px-4 font-mono text-[var(--secondary)]/60">500 Chars</td>
                  <td className="py-3 px-4 font-mono text-[var(--accent)]">1,000 Chars</td>
                  <td className="py-3 px-4 font-mono font-bold">1,500 Chars (Max)</td>
                </tr>
                <tr className="hover:bg-[var(--secondary)]/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--secondary)] bg-[var(--primary)] sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Daily Post Limit (24h)</td>
                  <td className="py-3 px-4 font-mono">3 Posts / 24h</td>
                  <td className="py-3 px-4 font-mono">10 Posts / 24h</td>
                  <td className="py-3 px-4 font-mono font-bold text-[var(--accent)]">15 Posts / 24h</td>
                </tr>
                <tr className="hover:bg-[var(--secondary)]/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--secondary)] bg-[var(--primary)] sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Research Publishing</td>
                  <td className="py-3 px-4 font-mono">1 Article / Month</td>
                  <td className="py-3 px-4 font-mono">4 Articles / Month</td>
                  <td className="py-3 px-4 font-mono font-bold text-[var(--accent)]">10 Articles / Month</td>
                </tr>
                <tr className="hover:bg-[var(--secondary)]/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--secondary)] bg-[var(--primary)] sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Financial Threshold / Cap</td>
                  <td className="py-3 px-4 text-[var(--secondary)]/50 italic">$0 (Browse Only)</td>
                  <td className="py-3 px-4 font-mono font-bold">Up to $500,000</td>
                  <td className="py-3 px-4 font-mono font-black text-[var(--accent)]">Unlimited / Up to $5M</td>
                </tr>
                <tr className="hover:bg-[var(--secondary)]/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--secondary)] bg-[var(--primary)] sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Pitch / Bid Decks</td>
                  <td className="py-3 px-4 text-[var(--secondary)]/50">1 (Draft Mode Only)</td>
                  <td className="py-3 px-4 font-bold">3 Active Decks</td>
                  <td className="py-3 px-4 font-bold text-[var(--accent)]">Unlimited Active Decks</td>
                </tr>
                <tr className="hover:bg-[var(--secondary)]/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--secondary)] bg-[var(--primary)] sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Emporium Ads</td>
                  <td className="py-3 px-4">Pay-as-you-go</td>
                  <td className="py-3 px-4 text-[var(--accent)] font-bold">+ 10% Discount</td>
                  <td className="py-3 px-4 text-[var(--accent)] font-bold">+ 1 Free Ad / Month</td>
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