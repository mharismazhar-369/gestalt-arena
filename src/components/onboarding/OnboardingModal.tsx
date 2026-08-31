"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types/user";

export default function OnboardingModal({ user, profile }: { user: any, profile: UserProfile }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(!profile.profile_completed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Shared
  const [nickname, setNickname] = useState(profile.nickname || "");
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
      nickname,
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
      updateData.preferred_stages = preferredStages.split(",").map((s: string) => s.trim());
      updateData.industries_of_interest = industries.split(",").map((s: string) => s.trim());
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
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Username / Display Name</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="How should we call you in the feed?"
                  required
                />
              </div>

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
            </div>

            {/* Rest of the startup/investor conditional rendering remains identical */}
            {profile.role === "startup" && (
              <div className="space-y-4">
                {/* ... existing startup inputs ... */}
              </div>
            )}

            {/* ... rest of the component ... */}

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