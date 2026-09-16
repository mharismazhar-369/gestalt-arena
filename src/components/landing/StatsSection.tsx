"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import Background from "./Background";

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
      className="flex flex-col items-center justify-center p-6 bg-white/75 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform"
    >
      <div className="relative flex items-center justify-center w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
          <motion.circle
            cx="64" cy="64" r={radius}
            stroke={colorHex} strokeWidth="8" fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800">{count.toLocaleString()}</span>
        </div>
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">{title}</h3>
    </motion.div>
  );
};

export default function StatsSection() {
  const [lockedCapital, setLockedCapital] = useState<number>(0);
  const [facilitatorFees, setFacilitatorFees] = useState<number>(0);
  const [fundraisingRequests, setFundraisingRequests] = useState<number>(0);
  const [deploymentMandates, setDeploymentMandates] = useState<number>(0);

  const [investorCount, setInvestorCount] = useState<number>(0);
  const [startupCount, setStartupCount] = useState<number>(0);
  const [countryCount, setCountryCount] = useState<number>(0);
  const [visitorCount, setVisitorCount] = useState<number>(0);

  useEffect(() => {
    async function recordVisit() {
      if (sessionStorage.getItem("has_visited")) return;

      try {
        let country = null;

        try {
          const geoResponse = await fetch("https://ipapi.co/json/");
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            country = geoData.country_name || null;
          }
        } catch {
          // Country detection is optional.
          // The visit itself should still be recorded.
        }

        const { error } = await supabase
          .from("site_visits")
          .insert([
            {
              user_agent: navigator.userAgent,
              country,
            },
          ]);

        if (!error) {
          sessionStorage.setItem("has_visited", "true");
        }
      } catch (error) {
        console.error("Failed to record visit:", error);
      }
    }

    async function fetchPlatformStats() {
      try {
        // ---------------------------------------------------------
        // EXISTING FINANCIAL STATS
        // ---------------------------------------------------------
        const { data: statsData, error: statsError } = await supabase.rpc(
          "get_platform_extended_stats"
        );

        if (statsError) {
          console.error("Platform stats error:", statsError);
        }

        if (statsData && statsData.length > 0) {
          const row = statsData[0];

          const raised = Number(row.total_capital_raised) || 0;

          setLockedCapital(raised);
          setFacilitatorFees(raised * 0.02);
          setFundraisingRequests(
            Number(row.total_fundraising_requests) || 0
          );
          setDeploymentMandates(
            Number(row.total_deployment_mandates) || 0
          );
        }

        // ---------------------------------------------------------
        // REGISTERED INVESTORS
        // ---------------------------------------------------------
        const { data: investorData, error: investorError } =
          await supabase.rpc("get_registered_investor_count");

        if (investorError) {
          console.error("Investor count error:", investorError);
        } else {
          setInvestorCount(Number(investorData) || 0);
        }

        // ---------------------------------------------------------
        // STARTUP FOUNDERS
        // ---------------------------------------------------------
        const { data: startupData, error: startupError } =
          await supabase.rpc("get_registered_startup_count");

        if (startupError) {
          console.error("Startup count error:", startupError);
        } else {
          setStartupCount(Number(startupData) || 0);
        }

        // ---------------------------------------------------------
        // TOTAL VISITORS
        // ---------------------------------------------------------
        const { count: visitsCount, error: visitsError } =
          await supabase
            .from("site_visits")
            .select("id", {
              count: "exact",
              head: true,
            });

        if (visitsError) {
          console.error("Visitor count error:", visitsError);
        } else {
          setVisitorCount(visitsCount || 0);
        }

        // ---------------------------------------------------------
        // GLOBAL REACH
        // Countries represented in site_visits
        // ---------------------------------------------------------
        const { data: countryData, error: countryError } =
          await supabase
            .from("site_visits")
            .select("country")
            .not("country", "is", null);

        if (countryError) {
          console.error("Country count error:", countryError);
        } else if (countryData) {
          const uniqueCountries = new Set(
            countryData
              .map((row) => row.country)
              .filter(
                (country): country is string =>
                  typeof country === "string" && country.trim().length > 0
              )
          );

          setCountryCount(uniqueCountries.size);
        }
      } catch (error) {
        console.error("Failed to fetch platform statistics:", error);
      }
    }

    recordVisit();
    fetchPlatformStats();
  }, []);

  return (
    <section id="stats" className="relative z-10 mx-auto max-w-7xl px-6 py-28">
      <Background />
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Platform at a Glance</h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600 font-medium leading-relaxed">
          Built for discovering and connecting opportunities & showcasing yourself. Browse freely, connect securely, and negotiate on your own terms.
        </p>
      </motion.div>

      {/* Main Financial Metrics Grid */}
      <div className="mt-16 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-white/80 bg-white/75 p-6 backdrop-blur-xl shadow-sm text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Total Capital Raised</p>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-500">
            ${lockedCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-white/80 bg-white/75 p-6 backdrop-blur-xl shadow-sm text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Fund Raising Requests</p>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-cyan-500">
            ${fundraisingRequests.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-white/80 bg-white/75 p-6 backdrop-blur-xl shadow-sm text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Capital Deployment Mandates</p>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500">
            ${deploymentMandates.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-white/80 bg-white/75 p-6 backdrop-blur-xl shadow-sm text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Platform Revenue (2%)</p>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-500 to-pink-500">
            ${facilitatorFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </motion.div>
      </div>

      {/* Dial Charts Grid */}
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
        <DialChart title="Registered Investors" count={investorCount} target={1000} colorHex="#3b82f6" delay={0.1} />
        <DialChart title="Startup Founders" count={startupCount} target={1000} colorHex="#8b5cf6" delay={0.2} />
        <DialChart title="Global Reach (Countries)" count={countryCount} target={195} colorHex="#f59e0b" delay={0.3} />
        <DialChart title="Total Visitors" count={visitorCount} target={10000} colorHex="#10b981" delay={0.4} />
      </div>
    </section>
  );
}