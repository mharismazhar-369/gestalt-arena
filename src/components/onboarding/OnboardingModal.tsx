"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UserProfile, UserRole } from "@/types/user";

export default function OnboardingModal({ user, profile }: { user: any, profile: UserProfile }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(!profile.profile_completed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Shared
  const [bio, setBio] = useState(profile.bio || "");
  
  // Startup
  const [companyName, setCompanyName] = useState(profile.company_name || "");
  const [elevatorPitch, setElevatorPitch] = useState(profile.elevator_pitch || "");
  const [traction, setTraction] = useState(profile.traction || "");
  const [fundingGoal, setFundingGoal] = useState(profile.funding_goal || "");
  const [stage, setStage] = useState(profile.stage || "");
  const [pitchDeckUrl, setPitchDeckUrl] = useState(profile.pitch_deck_url || "");

  // Investor
  const [investmentThesis, setInvestmentThesis] = useState(profile.investment_thesis || "");
  const [ticketSize, setTicketSize] = useState(profile.ticket_size || "");
  const [preferredStages, setPreferredStages] = useState(profile.preferred_stages?.join(", ") || "");
  const [industries, setIndustries] = useState(profile.industries_of_interest?.join(", ") || "");
  const [firmDetails, setFirmDetails] = useState(profile.firm_details || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const updateData: any = {
      profile_completed: true,
      bio,
    };

    if (profile.role === "startup") {
      updateData.company_name = companyName;
      updateData.elevator_pitch = elevatorPitch;
      updateData.traction = traction;
      updateData.funding_goal = fundingGoal;
      updateData.stage = stage;
      updateData.pitch_deck_url = pitchDeckUrl;
    } else if (profile.role === "investor") {
      updateData.investment_thesis = investmentThesis;
      updateData.ticket_size = ticketSize;
      updateData.preferred_stages = preferredStages.split(",").map((s) => s.trim());
      updateData.industries_of_interest = industries.split(",").map((s) => s.trim());
      updateData.firm_details = firmDetails;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", profile.id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setIsOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl relative my-8"
        >
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white">Complete Your Profile</h2>
            <p className="text-zinc-400 mt-2">
              Let's get your {profile.role} profile set up before you enter the Arena.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none min-h-[100px]"
                placeholder="A short bio about yourself..."
                required
              />
            </div>

            {profile.role === "startup" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Stage</label>
                    <input
                      type="text"
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      placeholder="e.g. Pre-seed, Seed, Series A"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">Elevator Pitch</label>
                  <textarea
                    value={elevatorPitch}
                    onChange={(e) => setElevatorPitch(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none min-h-[80px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Current Traction</label>
                    <input
                      type="text"
                      value={traction}
                      onChange={(e) => setTraction(e.target.value)}
                      placeholder="e.g. $10k MRR, 100k MAU"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Funding Goal</label>
                    <input
                      type="text"
                      value={fundingGoal}
                      onChange={(e) => setFundingGoal(e.target.value)}
                      placeholder="e.g. Raising $1.5M"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">Pitch Deck URL</label>
                  <input
                    type="url"
                    value={pitchDeckUrl}
                    onChange={(e) => setPitchDeckUrl(e.target.value)}
                    placeholder="Link to PDF or Video"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {profile.role === "investor" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">Investment Thesis</label>
                  <textarea
                    value={investmentThesis}
                    onChange={(e) => setInvestmentThesis(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none min-h-[80px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Ticket Size</label>
                    <input
                      type="text"
                      value={ticketSize}
                      onChange={(e) => setTicketSize(e.target.value)}
                      placeholder="e.g. $50k - $250k"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Preferred Stages</label>
                    <input
                      type="text"
                      value={preferredStages}
                      onChange={(e) => setPreferredStages(e.target.value)}
                      placeholder="Pre-seed, Seed, Series A (comma separated)"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">Industries of Interest</label>
                  <input
                    type="text"
                    value={industries}
                    onChange={(e) => setIndustries(e.target.value)}
                    placeholder="Fintech, AI, SaaS (comma separated)"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">Firm Details</label>
                  <input
                    type="text"
                    value={firmDetails}
                    onChange={(e) => setFirmDetails(e.target.value)}
                    placeholder="Firm name or Angel Network"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 p-4 font-bold text-black transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Enter the Arena"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
