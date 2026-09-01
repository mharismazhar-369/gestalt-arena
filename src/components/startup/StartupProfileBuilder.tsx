"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { UserProfile } from "@/types/user";

export default function StartupProfileBuilder({ profile }: { profile: UserProfile }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Extracted fields for Startup initialization
    const [nickname, setNickname] = useState(profile.nickname || "");
    const [bio, setBio] = useState(profile.bio || "");
    const [companyName, setCompanyName] = useState(profile.company_name || "");
    const [elevatorPitch, setElevatorPitch] = useState(profile.elevator_pitch || "");
    const [traction, setTraction] = useState(profile.traction || "");
    const [fundingGoal, setFundingGoal] = useState(profile.funding_goal || "");
    const [stage, setStage] = useState(profile.stage || "");
    const [pitchDeckUrl, setPitchDeckUrl] = useState(profile.pitch_deck_url || "");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await supabase
            .from("profiles")
            .update({
                profile_completed: true,
                nickname,
                bio,
                company_name: companyName,
                elevator_pitch: elevatorPitch,
                traction,
                funding_goal: fundingGoal,
                stage,
                pitch_deck_url: pitchDeckUrl,
            })
            .eq("id", profile.id);

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setLoading(false);
        // Refresh the server component to trigger the dashboard view
        router.refresh();
    }

    return (
        <div className="trionn-glass-card rounded-3xl border border-violet-500/30 bg-[#0a0a0a]/90 p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white">Startup Profile Setup</h2>
                <p className="text-zinc-400 mt-2">
                    Tell investors about your company and funding requirements before entering the Arena.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Founder Name / Username *</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 focus:outline-none"
                            placeholder="How should investors address you?"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Company Name *</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 focus:outline-none"
                            placeholder="e.g., Gestalt Technologies"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Elevator Pitch *</label>
                    <textarea
                        value={elevatorPitch}
                        onChange={(e) => setElevatorPitch(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 focus:outline-none min-h-[80px]"
                        placeholder="Describe your product and the problem it solves in one or two sentences..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Founder Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 focus:outline-none min-h-[80px]"
                        placeholder="A short introduction about your background and team..."
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Current Stage</label>
                        <input
                            type="text"
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 focus:outline-none"
                            placeholder="e.g., Pre-Seed, Seed, Series A"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Funding Goal ($)</label>
                        <input
                            type="text"
                            value={fundingGoal}
                            onChange={(e) => setFundingGoal(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 focus:outline-none"
                            placeholder="e.g., $500,000"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Traction Summary</label>
                        <input
                            type="text"
                            value={traction}
                            onChange={(e) => setTraction(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 focus:outline-none"
                            placeholder="e.g., $10k MRR, 5k Active Users"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Pitch Deck URL</label>
                        <input
                            type="url"
                            value={pitchDeckUrl}
                            onChange={(e) => setPitchDeckUrl(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-violet-400 focus:outline-none"
                            placeholder="Link to DocSend, Drive, etc."
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-violet-400 p-4 font-bold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                    {loading ? "Saving Profile..." : "Complete Profile & Enter the Arena"}
                </button>
            </form>
        </div>
    );
}