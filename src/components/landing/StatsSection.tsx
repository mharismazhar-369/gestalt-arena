"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

// Reusable animated Dial Chart component
const DialChart = ({
  title,
  count,
  target,
  colorHex,
  delay
}: {
  title: string;
  count: number;
  target: number;
  colorHex: string;
  delay: number
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = count > 0 ? Math.min((count / target) * 100, 100) : 0;
  const strokeDashoffset = circumference - (fillPercentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col items-center justify-center p-6 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform"
    >
      <div className="relative flex items-center justify-center w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            stroke={colorHex}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800">
            {count.toLocaleString()}
          </span>
        </div>
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">
        {title}
      </h3>
    </motion.div>
  );
};

export default function StatsSection() {
  const [lockedCapital, setLockedCapital] = useState<number>(0);
  const [facilitatorFees, setFacilitatorFees] = useState<number>(0);

  const [investorCount, setInvestorCount] = useState<number>(0);
  const [startupCount, setStartupCount] = useState<number>(0);
  const [countryCount, setCountryCount] = useState<number>(0);
  const [visitorCount, setVisitorCount] = useState<number>(0);

  useEffect(() => {
    // 1. Push: Register a unique visit for this session
    async function recordVisit() {
      if (!sessionStorage.getItem('has_visited')) {
        // Note: Requires creating a 'site_visits' table in Supabase
        const { error } = await supabase.from('site_visits').insert([{ user_agent: navigator.userAgent }]);
        if (!error) {
          sessionStorage.setItem('has_visited', 'true');
        }
      }
    }
    recordVisit();

    // 2. Pull: Fetch all live stats
    async function fetchPlatformStats() {
      // Capital & Fees
      const { data: dealsData } = await supabase
        .from('deal_negotiations')
        .select('ticket_size')
        .eq('status', 'Accepted');

      if (dealsData) {
        const totalCapital = dealsData.reduce((sum, deal) => sum + (Number(deal.ticket_size) || 0), 0);
        setLockedCapital(totalCapital);
        setFacilitatorFees(totalCapital * 0.02);
      }

      // User Counts
      const [investors, startups, visits] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'investor'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'startup'),
        // Note: Requires the 'site_visits' table
        supabase.from('site_visits').select('id', { count: 'exact', head: true })
      ]);

      if (investors.count !== null) setInvestorCount(investors.count);
      if (startups.count !== null) setStartupCount(startups.count);
      if (visits.count !== null) setVisitorCount(visits.count);

      // Countries Count: Fetch unique countries from active profiles[cite: 5]
      const { data: countryData } = await supabase
        .from('profiles')
        .select('country')
        .not('country', 'is', null);

      if (countryData) {
        const uniqueCountries = new Set(countryData.map(p => p.country));
        setCountryCount(uniqueCountries.size);
      }
    }

    fetchPlatformStats();
  }, []);

  return (
    <section id="stats" className="relative z-10 mx-auto max-w-7xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Platform at a Glance
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600 font-medium leading-relaxed">
          Built to connect opportunities—not process investments. Browse freely, connect securely, and negotiate independently.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 mx-auto max-w-4xl rounded-3xl border border-white/80 bg-white/70 p-8 md:p-12 backdrop-blur-xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-around gap-8 transition-all"
      >
        <div className="text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Total Capital Locked</p>
          <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-500">
            ${lockedCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </div>
        <div className="hidden md:block w-px h-16 bg-slate-200"></div>
        <div className="text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Platform Fees Generated</p>
          <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500">
            ${facilitatorFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </div>
      </motion.div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
        <DialChart
          title="Registered Investors"
          count={investorCount}
          target={500}
          colorHex="#3b82f6"
          delay={0.1}
        />
        <DialChart
          title="Startup Founders"
          count={startupCount}
          target={1000}
          colorHex="#8b5cf6"
          delay={0.2}
        />
        <DialChart
          title="Global Reach (Countries)"
          count={countryCount}
          target={195}
          colorHex="#f59e0b"
          delay={0.3}
        />
        <DialChart
          title="Total Visitors"
          count={visitorCount}
          target={10000}
          colorHex="#10b981"
          delay={0.4}
        />
      </div>
    </section>
  );
}