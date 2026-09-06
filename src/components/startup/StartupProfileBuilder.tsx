"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { UserProfile } from "@/types/user";
import { Rocket, Building, MapPin, Activity, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function StartupProfileBuilder({ profile }: { profile: UserProfile }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Core Profile State
    const [nickname, setNickname] = useState(profile.nickname || "");
    const [username, setUsername] = useState(profile.username || "");
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [companyName, setCompanyName] = useState(profile.company_name || "");
    const [bio, setBio] = useState(profile.bio || "");
    const [elevatorPitch, setElevatorPitch] = useState(profile.elevator_pitch || "");
    const [country, setCountry] = useState(profile.country || "");
    const [city, setCity] = useState(profile.city || "");
    const [industry, setIndustry] = useState(profile.industry || "");

    // Startup Operational Metrics (For AI Engine)
    const [companySize, setCompanySize] = useState("1-10");
    const [currentArr, setCurrentArr] = useState(0);
    const [runwayMonths, setRunwayMonths] = useState(12);
    const [targetExit, setTargetExit] = useState("acquisition");
    const [technicalMoat, setTechnicalMoat] = useState("");

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
                    elevator_pitch: elevatorPitch,
                    country,
                    city,
                    industry,
                    updated_at: new Date().toISOString()
                })
                .eq("id", profile.id);

            if (profileError) throw profileError;

            // 2. Initialize AI Engine Startup Metrics
            const { error: startupError } = await supabase
                .from("startup_profiles")
                .upsert({
                    profile_id: profile.id,
                    company_size: companySize,
                    current_arr: currentArr,
                    runway_months: runwayMonths,
                    target_exit: targetExit,
                    technical_moat: technicalMoat,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'profile_id' }); // <-- Conflict resolution fix added here

            if (startupError) throw startupError;

            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to initialize startup profile.");
            setLoading(false);
        }
    }

    return (
        <div className="neu-flat-base p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[var(--secondary)]/5 pointer-events-none">
                <Rocket size={140} />
            </div>

            <div className="mb-8 relative z-10 border-b border-[var(--secondary)]/10 pb-6">
                <h2 className="text-3xl font-black text-[var(--secondary)] flex items-center gap-3">
                    <Rocket size={28} className="text-[var(--accent)]" /> Startup Profile Setup
                </h2>
                <p className="text-[var(--secondary)]/70 mt-2 font-medium">
                    Configure your operational metrics to align with investor mandates and AI tracking.
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
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Founder Name *</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                                placeholder="How should investors address you?"
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
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Company Name *</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                                placeholder="Legal Entity Name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block flex items-center gap-1"><MapPin size={12} /> Country</label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition shadow-inner"
                                placeholder="e.g. United Kingdom"
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
                                placeholder="e.g. London"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Primary Industry</label>
                            <select
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                            >
                                <option value="">Select Industry...</option>
                                <option value="SaaS">B2B SaaS</option>
                                <option value="FinTech">FinTech</option>
                                <option value="AI/ML">AI / Machine Learning</option>
                                <option value="DeepTech">DeepTech</option>
                                <option value="HealthTech">HealthTech</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Elevator Pitch *</label>
                        <textarea
                            value={elevatorPitch}
                            onChange={(e) => setElevatorPitch(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition resize-none shadow-inner min-h-[60px]"
                            placeholder="Describe your product and the problem it solves in one or two sentences..."
                            required
                        />
                    </div>
                </div>

                {/* AI Matching Metrics Section */}
                <div className="space-y-6 pt-4 border-t border-[var(--secondary)]/10">
                    <h3 className="text-xs font-bold text-[var(--secondary)]/80 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={14} className="text-[var(--accent)]" /> AI Operations & Scale
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Current ARR ($)</label>
                            <input
                                type="number"
                                value={currentArr}
                                onChange={(e) => setCurrentArr(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Runway (Months)</label>
                            <input
                                type="number"
                                value={runwayMonths}
                                onChange={(e) => setRunwayMonths(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition font-mono shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Company Size</label>
                            <select
                                value={companySize}
                                onChange={(e) => setCompanySize(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                            >
                                <option value="1-10">1 - 10</option>
                                <option value="11-50">11 - 50</option>
                                <option value="51-200">51 - 200</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Target Exit Strategy</label>
                            <select
                                value={targetExit}
                                onChange={(e) => setTargetExit(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition appearance-none shadow-inner"
                            >
                                <option value="acquisition">Strategic Acquisition (M&A)</option>
                                <option value="ipo">IPO</option>
                                <option value="pe_buyout">Private Equity Buyout</option>
                                <option value="undecided">Undecided / Growth Focus</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--secondary)]/70 tracking-wider block">Technical Moat / IP</label>
                        <textarea
                            value={technicalMoat}
                            onChange={(e) => setTechnicalMoat(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--secondary)]/10 bg-[var(--primary)] text-sm text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none transition resize-none shadow-inner min-h-[60px]"
                            placeholder="Proprietary models, patents, network effects..."
                        />
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