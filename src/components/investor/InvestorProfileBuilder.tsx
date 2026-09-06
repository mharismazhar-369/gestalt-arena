"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { UserProfile } from "@/types/user";
import { Target, DollarSign, Building, MapPin, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function InvestorProfileBuilder({ profile }: { profile: UserProfile }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Core Profile State
    const [nickname, setNickname] = useState(profile.nickname || "");
    const [username, setUsername] = useState(profile.username || "");
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [companyName, setCompanyName] = useState(profile.company_name || ""); // Firm Details
    const [bio, setBio] = useState(profile.bio || "");
    const [country, setCountry] = useState(profile.country || "");
    const [city, setCity] = useState(profile.city || "");
    const [industry, setIndustry] = useState(profile.industry || "");

    // Investor Preferences State (For AI Engine)
    const [minTicket, setMinTicket] = useState(50000);
    const [maxTicket, setMaxTicket] = useState(500000);
    const [preferredStages, setPreferredStages] = useState("");
    const [riskTolerance, setRiskTolerance] = useState("balanced");
    const [targetCompanySize, setTargetCompanySize] = useState("1-10");

    // Real-Time Username Checker
    useEffect(() => {
        if (!username || username.length < 3) {
            setUsernameStatus('idle');
            return;
        }

        const checkAvailability = async () => {
            setUsernameStatus('checking');
            const { data } = await supabase
                .from("profiles")
                .select("id")
                .eq("username", username)
                .maybeSingle();

            if (data && data.id !== profile.id) {
                setUsernameStatus('taken');
            } else {
                setUsernameStatus('available');
            }
        };

        const timeoutId = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [username, profile.id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (usernameStatus === 'taken') return;

        setLoading(true);
        setError("");

        try {
            // 1. Update Core Profile
            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    profile_completed: true,
                    nickname,
                    username,
                    company_name: companyName,
                    bio,
                    country,
                    city,
                    industry,
                    updated_at: new Date().toISOString()
                })
                .eq("id", profile.id);

            if (profileError) throw profileError;

            // 2. Initialize AI Engine Preferences
            const stagesArray = preferredStages.split(",").map((s) => s.trim()).filter(Boolean);

            const { error: prefError } = await supabase
                .from("investor_preferences")
                .upsert({
                    investor_id: profile.id,
                    min_ticket: minTicket,
                    max_ticket: maxTicket,
                    preferred_stages: stagesArray,
                    risk_tolerance: riskTolerance,
                    target_company_size: targetCompanySize,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'investor_id' }); // <-- Conflict resolution fix added here

            if (prefError) throw prefError;

            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to initialize investor profile.");
            setLoading(false);
        }
    }

    return (
        <div className="neu-flat-base p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[var(--secondary)]/5 pointer-events-none">
                <Target size={140} />
            </div>

            <div className="mb-8 relative z-10 border-b border-[var(--secondary)]/10 pb-6">
                <h2 className="text-3xl font-black text-[var(--secondary)] flex items-center gap-3">
                    <Target size={28} className="text-[var(--accent)]" /> Investor Profile Setup
                </h2>
                <p className="text-[var(--secondary)]/70 mt-2 font-medium">
                    Establish your identity and operational metrics to initialize the AI Deal-Flow Engine.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                {/* Core Identity Section */}
                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-[var(--secondary)]/80 uppercase tracking-wider flex items-center gap-1.5">
                        <Building size={14} className="text-[var(--accent)]" /> Core Identity
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Display Name *</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                                placeholder="How should founders address you?"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">@ Username (Handle) *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--secondary)]/50 font-mono">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    className={`w-full pl-8 pr-10 py-3 rounded-xl border bg-[var(--primary)] text-sm text-[var(--secondary)] focus:outline-none transition shadow-inner ${usernameStatus === 'taken' ? 'border-rose-500 focus:border-rose-500' : 'border-[var(--secondary)]/10 focus:border-[var(--accent)]'}`}
                                    placeholder="unique_handle"
                                    required
                                    minLength={3}
                                    maxLength={20}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {usernameStatus === 'checking' && <Loader2 size={16} className="animate-spin text-[var(--accent)]" />}
                                    {usernameStatus === 'available' && <CheckCircle size={16} className="text-emerald-500" />}
                                    {usernameStatus === 'taken' && <XCircle size={16} className="text-rose-500" />}
                                </div>
                            </div>
                            {usernameStatus === 'taken' && <p className="text-[10px] text-rose-500 font-bold mt-1">This handle is already taken.</p>}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Firm / Fund Details</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                                placeholder="VC, Syndicate, or Angel group"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider flex items-center gap-1 block"><MapPin size={12} /> Country</label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                                placeholder="e.g., United States"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">City / Hub</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                                placeholder="e.g., San Francisco"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Investment Thesis / Bio *</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition resize-none shadow-inner min-h-[80px]"
                            placeholder="Describe your core philosophy and what you look for in a startup..."
                            required
                        />
                    </div>
                </div>

                {/* AI Matching Metrics Section */}
                <div className="space-y-6 pt-4 border-t border-[var(--secondary)]/10">
                    <h3 className="text-xs font-bold text-[var(--secondary)]/80 uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign size={14} className="text-[var(--accent)]" /> AI Deployment Metrics
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Min Ticket ($)</label>
                            <input
                                type="number"
                                value={minTicket}
                                onChange={(e) => setMinTicket(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Max Ticket ($)</label>
                            <input
                                type="number"
                                value={maxTicket}
                                onChange={(e) => setMaxTicket(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Preferred Stages (Comma separated)</label>
                            <input
                                type="text"
                                value={preferredStages}
                                onChange={(e) => setPreferredStages(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                                placeholder="e.g., Pre-Seed, Seed, Series A"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Risk Tolerance</label>
                            <select
                                value={riskTolerance}
                                onChange={(e) => setRiskTolerance(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                            >
                                <option value="conservative">Conservative</option>
                                <option value="balanced">Balanced</option>
                                <option value="aggressive">Aggressive (Deep Tech)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error && <p className="text-sm font-bold text-rose-600 bg-rose-500/10 p-3 rounded-lg border border-rose-500/30">{error}</p>}

                <button
                    type="submit"
                    disabled={loading || usernameStatus === 'checking' || usernameStatus === 'taken'}
                    className="neu-btn w-full py-4 text-sm font-bold disabled:opacity-50 mt-4"
                >
                    {loading ? "Initializing AI Engine..." : "Complete Profile & Enter the Arena"}
                </button>
            </form>
        </div>
    );
}