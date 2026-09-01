"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { UserProfile } from "@/types/user";

export default function InvestorProfileBuilder({ profile }: { profile: UserProfile }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Extracted fields from your old OnboardingModal
    const [nickname, setNickname] = useState(profile.nickname || "");
    const [bio, setBio] = useState(profile.bio || "");
    const [investmentThesis, setInvestmentThesis] = useState(profile.investment_thesis || "");
    const [ticketSize, setTicketSize] = useState(profile.ticket_size || "");
    const [preferredStages, setPreferredStages] = useState(profile.preferred_stages?.join(", ") || "");
    const [industries, setIndustries] = useState(profile.industries_of_interest?.join(", ") || "");
    const [firmDetails, setFirmDetails] = useState(profile.firm_details || "");

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
                investment_thesis: investmentThesis,
                ticket_size: ticketSize,
                preferred_stages: preferredStages.split(",").map((s) => s.trim()).filter(Boolean),
                industries_of_interest: industries.split(",").map((s) => s.trim()).filter(Boolean),
                firm_details: firmDetails,
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
        <div className="trionn-glass-card rounded-3xl border border-cyan-500/30 bg-[#0a0a0a]/90 p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white">Investor Profile Setup</h2>
                <p className="text-zinc-400 mt-2">
                    Establish your identity and investment preferences before accessing deal flows.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Display Name / Nickname *</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                            placeholder="How should founders address you?"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Ticket Size ($)</label>
                        <input
                            type="text"
                            value={ticketSize}
                            onChange={(e) => setTicketSize(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                            placeholder="e.g., $50k - $250k"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Bio *</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none min-h-[80px]"
                        placeholder="A short introduction about yourself and your background..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Investment Thesis</label>
                    <textarea
                        value={investmentThesis}
                        onChange={(e) => setInvestmentThesis(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none min-h-[80px]"
                        placeholder="Describe your core philosophy and what you look for in a startup..."
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Preferred Stages (Comma separated)</label>
                        <input
                            type="text"
                            value={preferredStages}
                            onChange={(e) => setPreferredStages(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                            placeholder="e.g., Pre-Seed, Seed, Series A"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Target Industries (Comma separated)</label>
                        <input
                            type="text"
                            value={industries}
                            onChange={(e) => setIndustries(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                            placeholder="e.g., SaaS, Fintech, AI, DeepTech"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Firm / Fund Details</label>
                    <input
                        type="text"
                        value={firmDetails}
                        onChange={(e) => setFirmDetails(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="Name of your VC, Syndicate, or Family Office (if applicable)"
                    />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-cyan-400 p-4 font-bold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                    {loading ? "Saving Profile..." : "Complete Profile & Enter the Arena"}
                </button>
            </form>
        </div>
    );
}