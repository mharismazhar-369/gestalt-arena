"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BetaBadge from "@/components/shared/BetaBadge";
import { User, Settings, Save, ShieldCheck, MapPin, Building2, Tag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileSettingsPage() {
  const [nickname, setNickname] = useState("Strategic Partner");
  const [role, setRole] = useState("investor");
  const [city, setCity] = useState("San Francisco");
  const [state, setState] = useState("CA");
  const [country, setCountry] = useState("United States");
  const [bio, setBio] = useState("Active early-stage investor supporting scalable technology, autonomous agent SDKs, deep-tech research, and B2B SaaS founders with growth capital and operator mentorship.");
  const [range, setRange] = useState("$25,000 – $250,000");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col justify-between trionn-grid-bg relative">
      <Navbar />

      <main className="pt-32 pb-24 px-6 mx-auto max-w-4xl w-full relative z-10 space-y-8">
        
        <div className="trionn-glass-card rounded-3xl border border-white/10 p-8 md:p-12 space-y-8 shadow-2xl">
          
          {/* Header */}
          <div className="border-b border-white/10 pb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-1">
                <Settings size={16} /> Account Preferences
              </div>
              <h1 className="text-3xl font-black text-white">Profile Settings</h1>
            </div>
            <BetaBadge variant="pill" />
          </div>

          {savedSuccess && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <ShieldCheck size={16} /> Profile UI changes updated in local form state.
            </div>
          )}

          {/* Settings Form */}
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Display Name / Pseudonym
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Primary Platform Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="investor">Angel Investor / VC Partner</option>
                  <option value="startup">Startup Founder / Entrepreneur</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  State / Region
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Target Investment Range / Raise Ask
              </label>
              <input
                type="text"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="e.g., $25,000 – $250,000"
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Window-Shopping Mandate / Pitch Summary
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-4 text-sm text-white focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>

            <div className="border-t border-white/10 pt-6 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-xs font-bold text-black shadow-lg hover:scale-105 transition"
              >
                <Save size={16} /> Save Profile Changes
              </button>
            </div>

          </form>

        </div>

      </main>

      <Footer />
    </div>
  );
}
